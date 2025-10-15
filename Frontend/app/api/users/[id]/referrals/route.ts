import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get all referrals for a specific patient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const referrals: any[] = await query(
      `SELECT 
        r.*,
        rt.name as referring_therapist_name,
        rt.email as referring_therapist_email,
        rt.Interested_field as referring_specialization,
        pt.name as psychiatrist_name,
        pt.email as psychiatrist_email,
        pt.Interested_field as psychiatrist_specialization,
        pt.bio as psychiatrist_bio,
        pt.educational_info as psychiatrist_education,
        pt.years_experience as psychiatrist_experience,
        pt.rating as psychiatrist_rating,
        pt.fees_min as psychiatrist_fees_min,
        pt.fees_max as psychiatrist_fees_max,
        pt.image as psychiatrist_image,
        s.session_date
      FROM referrals r
      JOIN therapists rt ON r.referring_therapist_id = rt.therapist_id
      LEFT JOIN therapists pt ON r.referred_to_therapist_id = pt.therapist_id
      LEFT JOIN sessions s ON r.session_id = s.session_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC`,
      [id]
    );

    // Get statistics for this patient
    const stats: any = {
      total: referrals.length,
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0,
      latest_referral_date: referrals.length > 0 ? referrals[0].created_at : null
    };

    referrals.forEach((ref: any) => {
      stats[ref.status] = (stats[ref.status] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      user_id: id,
      referrals,
      stats
    });

  } catch (error: any) {
    console.error('Error fetching user referrals:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user referrals',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
