import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch appointments with session and note status for a therapist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ therapistId: string }> }
) {
  try {
    const { therapistId } = await params;

    // Get all appointments for this therapist with session and note info
    const appointments = await query(`
      SELECT 
        a.appointment_id,
        a.user_id,
        a.therapist_id,
        a.start_time,
        a.end_time,
        a.status as appointment_status,
        a.created_at as appointment_created,
        u.name as user_name,
        u.email as user_email,
        -- Session info (if exists)
        s.session_id,
        s.session_date,
        s.duration_min,
        s.status as session_status,
        -- Session note info (if exists)
        sn.note_id,
        sn.summary,
        sn.homework,
        sn.therapist_private_notes,
        sn.visible_to_user,
        sn.created_at as note_created_at,
        -- Helper flags
        CASE WHEN s.session_id IS NOT NULL THEN 1 ELSE 0 END as has_session,
        CASE WHEN sn.note_id IS NOT NULL THEN 1 ELSE 0 END as has_note
      FROM appointments a
      JOIN users u ON a.user_id = u.user_id
      LEFT JOIN sessions s ON a.appointment_id = s.appointment_id
      LEFT JOIN session_notes sn ON s.session_id = sn.session_id
      WHERE a.therapist_id = ?
      ORDER BY a.start_time DESC
    `, [therapistId]);

    return NextResponse.json({
      success: true,
      appointments,
      count: appointments.length,
      summary: {
        total: appointments.length,
        with_sessions: appointments.filter((a: any) => a.has_session).length,
        with_notes: appointments.filter((a: any) => a.has_note).length,
        pending_notes: appointments.filter((a: any) => a.has_session && !a.has_note).length
      }
    });

  } catch (error) {
    console.error('Error fetching appointments with session status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
