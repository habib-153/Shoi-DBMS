import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const therapistId = id;

    console.log(`Fetching session notes for therapist: ${therapistId}`);

    // Get all session notes for sessions where this therapist is involved
    const sessionNotes = await query(`
      SELECT 
        sn.note_id,
        sn.session_id,
        sn.summary,
        sn.homework,
        sn.therapist_private_notes,
        sn.visible_to_user,
        sn.created_at,
        s.session_id,
        s.session_date,
        s.duration_min,
        s.appointment_id,
        a.appointment_id,
        a.user_id,
        a.therapist_id,
        a.start_time,
        a.end_time,
        a.status as appointment_status,
        u.user_id,
        u.name as user_name,
        u.email as user_email,
        t.therapist_id,
        t.name as therapist_name
      FROM session_notes sn
      JOIN sessions s ON sn.session_id = s.session_id
      JOIN appointments a ON s.appointment_id = a.appointment_id
      JOIN users u ON a.user_id = u.user_id
      JOIN therapists t ON a.therapist_id = t.therapist_id
      WHERE a.therapist_id = ?
      ORDER BY sn.created_at DESC
    `, [therapistId]);

    return NextResponse.json({
      success: true,
      sessionNotes: sessionNotes
    });

  } catch (error) {
    console.error('Error fetching therapist session notes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch session notes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
