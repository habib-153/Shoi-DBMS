import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all appointments with their sessions and notes for a therapist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ therapistId: string }> }
) {
  try {
    const { therapistId } = await params;

    // Get all completed appointments for this therapist with session and note info
    const appointments = await query(`
      SELECT 
        a.appointment_id,
        a.user_id,
        a.therapist_id,
        a.start_time,
        a.end_time,
        a.appointment_date,
        a.status as appointment_status,
        a.created_at as appointment_created_at,
        u.name as user_name,
        u.email as user_email,
        -- Session info
        s.session_id,
        s.session_date,
        s.created_at as session_created_at,
        -- Note info
        sn.note_id,
        sn.summary as note_summary,
        sn.homework as note_homework,
        sn.therapist_private_notes as note_private,
        sn.visible_to_user as note_visible
      FROM appointments a
      JOIN users u ON a.user_id = u.user_id
      LEFT JOIN sessions s ON a.appointment_id = s.appointment_id
      LEFT JOIN session_notes sn ON s.session_id = sn.session_id
      WHERE a.therapist_id = ?
        AND a.status = 'completed'
      ORDER BY a.appointment_date DESC, a.start_time DESC
    `, [therapistId]);

    return NextResponse.json({
      success: true,
      appointments,
      count: appointments.length
    });

  } catch (error) {
    console.error('Error fetching appointments with notes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
