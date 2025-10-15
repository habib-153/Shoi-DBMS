import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const referralId = parseInt(params.id);
    const body = await request.json();
    const { status, user_id, patient_notes } = body;

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
      `SELECT * FROM patient_referrals WHERE referral_id = ? AND user_id = ?`,
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

    // Update referral status
    await query(
      `UPDATE patient_referrals 
       SET status = ?, 
           patient_notes = ?,
           updated_at = NOW()
       WHERE referral_id = ?`,
      [status, patient_notes || null, referralId]
    );

    // Create notification for the referring therapist
    const notificationMessage = status === 'accepted'
      ? `Patient has accepted the referral to psychiatrist`
      : `Patient has declined the referral to psychiatrist`;

    await query(
      `INSERT INTO notifications (
        recipient_type,
        recipient_id,
        type,
        title,
        message,
        link,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        'therapist',
        referral.referring_therapist_id,
        'referral_response',
        `Referral ${status}`,
        notificationMessage,
        `/therapist/referrals?id=${referralId}`
      ]
    );

    // If accepted, also notify the psychiatrist
    if (status === 'accepted') {
      await query(
        `INSERT INTO notifications (
          recipient_type,
          recipient_id,
          type,
          title,
          message,
          link,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          'therapist',
          referral.referred_to_therapist_id,
          'referral_accepted',
          'Patient Accepted Referral',
          'A patient has accepted your referral and may contact you for an appointment',
          `/therapist/referrals?id=${referralId}`
        ]
      );
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
