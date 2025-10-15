import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/referrals/[id]/tracking - Get referral history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const referralId = params.id;

    const tracking = await query(
      `SELECT 
        rt.*,
        t.name as action_by_name,
        t.specialization as action_by_specialization
       FROM referral_tracking rt
       INNER JOIN therapists t ON rt.action_by = t.therapist_id
       WHERE rt.referral_id = ?
       ORDER BY rt.created_at DESC`,
      [referralId]
    );

    return NextResponse.json({
      success: true,
      data: tracking
    });
  } catch (error) {
    console.error('Error fetching referral tracking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch referral tracking history' 
      },
      { status: 500 }
    );
  }
}
