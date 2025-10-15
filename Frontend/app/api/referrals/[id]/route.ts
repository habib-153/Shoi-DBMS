import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get a specific referral
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const referrals: any[] = await query(
      `SELECT 
        r.*,
        u.name as patient_name,
        u.email as patient_email,
        u.phone as patient_phone,
        rt.name as referring_therapist_name,
        rt.email as referring_therapist_email,
        rt.phone as referring_therapist_phone,
        rt.specialization as referring_specialization,
        pt.name as referred_to_therapist_name,
        pt.email as referred_to_therapist_email,
        pt.phone as referred_to_therapist_phone,
        pt.specialization as referred_to_specialization,
        s.session_date,
        s.session_id
      FROM referrals r
      JOIN users u ON r.user_id = u.user_id
      JOIN therapists rt ON r.referring_therapist_id = rt.therapist_id
      LEFT JOIN therapists pt ON r.referred_to_therapist_id = pt.therapist_id
      LEFT JOIN sessions s ON r.session_id = s.session_id
      WHERE r.referral_id = ?`,
      [id]
    );

    if (referrals.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Referral not found' },
        { status: 404 }
      );
    }

    // Get comments for this referral
    const comments: any[] = await query(
      `SELECT 
        rc.*,
        t.name as therapist_name,
        t.specialization as therapist_specialization
      FROM referral_comments rc
      JOIN therapists t ON rc.therapist_id = t.therapist_id
      WHERE rc.referral_id = ?
      ORDER BY rc.created_at ASC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      referral: {
        ...referrals[0],
        comments
      }
    });

  } catch (error: any) {
    console.error('Error fetching referral:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch referral',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PATCH - Update referral status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, response_notes, therapist_id, referred_to_therapist_id } = body;

    // Verify referral exists
    const referrals: any[] = await query(
      'SELECT * FROM referrals WHERE referral_id = ?',
      [id]
    );

    if (referrals.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Referral not found' },
        { status: 404 }
      );
    }

    const referral = referrals[0];

    // Validate status
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);

      // Update timestamps based on status
      if (status === 'accepted') {
        updates.push('accepted_at = NOW()');
      } else if (status === 'completed') {
        updates.push('completed_at = NOW()');
      }
    }

    if (response_notes) {
      updates.push('response_notes = ?');
      values.push(response_notes);
    }

    if (referred_to_therapist_id) {
      // Verify the therapist exists
      const therapist: any[] = await query(
        'SELECT therapist_id, specialization FROM therapists WHERE therapist_id = ?',
        [referred_to_therapist_id]
      );

      if (therapist.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Specified therapist not found' },
          { status: 404 }
        );
      }

      updates.push('referred_to_therapist_id = ?');
      values.push(referred_to_therapist_id);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add referral_id to values for WHERE clause
    values.push(id);

    // Execute update
    await query(
      `UPDATE referrals SET ${updates.join(', ')}, updated_at = NOW() WHERE referral_id = ?`,
      values
    );

    // If there's a response_notes and therapist_id, add it as a comment
    if (response_notes && therapist_id) {
      await query(
        `INSERT INTO referral_comments (referral_id, therapist_id, comment)
         VALUES (?, ?, ?)`,
        [id, therapist_id, response_notes]
      );
    }

    // Fetch updated referral
    const updated: any[] = await query(
      `SELECT 
        r.*,
        u.name as patient_name,
        u.email as patient_email,
        rt.name as referring_therapist_name,
        pt.name as referred_to_therapist_name
      FROM referrals r
      JOIN users u ON r.user_id = u.user_id
      JOIN therapists rt ON r.referring_therapist_id = rt.therapist_id
      LEFT JOIN therapists pt ON r.referred_to_therapist_id = pt.therapist_id
      WHERE r.referral_id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Referral updated successfully',
      referral: updated[0]
    });

  } catch (error: any) {
    console.error('Error updating referral:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update referral',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a referral (soft delete by setting status to cancelled)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const therapist_id = searchParams.get('therapist_id');

    // Verify referral exists
    const referrals: any[] = await query(
      'SELECT * FROM referrals WHERE referral_id = ?',
      [id]
    );

    if (referrals.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Referral not found' },
        { status: 404 }
      );
    }

    const referral = referrals[0];

    // Only referring therapist can cancel
    if (therapist_id && referral.referring_therapist_id !== parseInt(therapist_id)) {
      return NextResponse.json(
        { success: false, error: 'Only the referring therapist can cancel this referral' },
        { status: 403 }
      );
    }

    // Update status to cancelled
    await query(
      'UPDATE referrals SET status = ?, updated_at = NOW() WHERE referral_id = ?',
      ['cancelled', id]
    );

    return NextResponse.json({
      success: true,
      message: 'Referral cancelled successfully'
    });

  } catch (error: any) {
    console.error('Error cancelling referral:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel referral',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
