import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get referrals for a specific therapist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'sent' or 'received'
    const status = searchParams.get('status');

    if (!type || !['sent', 'received'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'type parameter must be "sent" or "received"' },
        { status: 400 }
      );
    }

    let sql = `
      SELECT 
        r.*,
        u.name as patient_name,
        u.email as patient_email,
        u.phone as patient_phone,
        rt.name as referring_therapist_name,
        rt.Interested_field as referring_specialization,
        pt.name as referred_to_therapist_name,
        pt.Interested_field as referred_to_specialization,
        s.session_date
      FROM referrals r
      JOIN users u ON r.user_id = u.user_id
      JOIN therapists rt ON r.referring_therapist_id = rt.therapist_id
      LEFT JOIN therapists pt ON r.referred_to_therapist_id = pt.therapist_id
      LEFT JOIN sessions s ON r.session_id = s.session_id
      WHERE 
    `;

    const params_array: any[] = [];

    if (type === 'sent') {
      sql += 'r.referring_therapist_id = ?';
      params_array.push(id);
    } else {
      // 'received' - referrals to this therapist OR open referrals for psychiatrists
      sql += '(r.referred_to_therapist_id = ? OR (r.referred_to_therapist_id IS NULL AND r.status = ?))';
      params_array.push(id, 'pending');
    }

    if (status) {
      sql += ' AND r.status = ?';
      params_array.push(status);
    }

    sql += ' ORDER BY r.created_at DESC';

    const referrals = await query(sql, params_array);

    // Get statistics
    const stats: any = {
      total: referrals.length,
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0,
      by_severity: {
        moderate: 0,
        severe: 0,
        critical: 0
      }
    };

    referrals.forEach((ref: any) => {
      stats[ref.status] = (stats[ref.status] || 0) + 1;
      stats.by_severity[ref.severity_level] = (stats.by_severity[ref.severity_level] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      type,
      therapist_id: id,
      referrals,
      stats
    });

  } catch (error: any) {
    console.error('Error fetching therapist referrals:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch therapist referrals',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
