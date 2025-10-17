import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const referralId = parseInt(id);
    const body = await request.json();
    const { status, user_id, response_notes } = body;

    // Validate required fields
    if (!status || !user_id) {
      return NextResponse.json(
        { error: "Missing required fields: status, user_id" },
        { status: 400 }
      );
    }

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    // Check if referral exists and belongs to this user
    const referrals = await query(
      `SELECT * FROM referrals WHERE referral_id = ? AND user_id = ?`,
      [referralId, user_id]
    );

    if (!Array.isArray(referrals) || referrals.length === 0) {
      return NextResponse.json(
        { error: "Referral not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    const referral = referrals[0];

    // Check if already responded
    if (referral.status !== 'pending') {
      return NextResponse.json(
        { error: `This referral has already been ${referral.status}` },
        { status: 400 }
      );
    }

    // Update referral status (response_notes stored separately if needed)
    await query(
      `UPDATE referrals 
       SET status = ?, 
           updated_at = NOW()
       WHERE referral_id = ?`,
      [status, referralId]
    );

    // Create notification for the referring therapist
    try {
      const notificationMessage = status === 'accepted'
        ? `Patient has accepted the referral to psychiatrist`
        : `Patient has declined the referral to psychiatrist`;

      // Get next notification_id
      const maxNotifId: any = await query(
        `SELECT IFNULL(MAX(notification_id), 0) + 1 as next_id FROM notifications`
      );
      const nextNotifId = maxNotifId[0]?.next_id || 1;

      await query(
        `INSERT INTO notifications (
          notification_id,
          recipient_type,
          recipient_id,
          sender_type,
          sender_id,
          notification_type,
          title,
          message,
          related_id,
          action_url,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          nextNotifId,
          'therapist',
          referral.referring_therapist_id,
          'user',
          user_id,
          'referral',
          `Referral ${status}`,
          notificationMessage,
          referralId,
          `/therapist/referrals?id=${referralId}`
        ]
      );
    } catch (notifError) {
      console.error('Failed to create notification (non-critical):', notifError);
      // Continue anyway - referral update was successful
    }

    // If accepted, also notify the psychiatrist
    if (status === 'accepted') {
      try {
        // Get next notification_id
        const maxNotifId2: any = await query(
          `SELECT IFNULL(MAX(notification_id), 0) + 1 as next_id FROM notifications`
        );
        const nextNotifId2 = maxNotifId2[0]?.next_id || 1;

        await query(
          `INSERT INTO notifications (
            notification_id,
            recipient_type,
            recipient_id,
            sender_type,
            sender_id,
            notification_type,
            title,
            message,
            related_id,
            action_url,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            nextNotifId2,
            'therapist',
            referral.referred_to_therapist_id,
            'user',
            user_id,
            'referral',
            'Patient Accepted Referral',
            'A patient has accepted your referral and may contact you for an appointment',
            referralId,
            `/therapist/referrals?id=${referralId}`
          ]
        );
      } catch (notifError) {
        console.error('Failed to create psychiatrist notification (non-critical):', notifError);
        // Continue anyway
      }
    }

    return NextResponse.json({
      success: true,
      message: `Referral ${status} successfully`,
      referral_id: referralId
    });

  } catch (error) {
    console.error("Error updating referral:", error);
    return NextResponse.json(
      { error: "Failed to update referral status" },
      { status: 500 }
    );
  }
}
