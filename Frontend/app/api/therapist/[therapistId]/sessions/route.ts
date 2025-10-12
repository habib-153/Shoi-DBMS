import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all sessions for a therapist with appointment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ therapistId: string }> }
) {
  try {
    const { therapistId } = await params;

    // Get all sessions for this therapist through appointments
    const sessions = await query(`
      SELECT 
        s.session_id,
        s.appointment_id,
        s.session_date,
        s.duration_min,
        a.user_id,
        a.therapist_id,
        a.start_time,
        a.end_time,
        a.status as appointment_status,
        a.created_at as appointment_created_at,
        u.name as user_name,
        u.email as user_email,
        t.name as therapist_name,
        -- Check if session note exists
        (SELECT COUNT(*) FROM session_notes sn WHERE sn.session_id = s.session_id) as has_notes,
        -- Get the most recent note if it exists
        (SELECT note_id FROM session_notes sn WHERE sn.session_id = s.session_id ORDER BY sn.created_at DESC LIMIT 1) as note_id,
        (SELECT summary FROM session_notes sn WHERE sn.session_id = s.session_id ORDER BY sn.created_at DESC LIMIT 1) as note_summary
      FROM sessions s
      JOIN appointments a ON s.appointment_id = a.appointment_id
      JOIN users u ON a.user_id = u.user_id
      JOIN therapists t ON a.therapist_id = t.therapist_id
      WHERE a.therapist_id = ?
      ORDER BY a.created_at DESC, a.start_time DESC
    `, [therapistId]);

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length
    });

  } catch (error) {
    console.error('Error fetching therapist sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST - Manually create a session for an appointment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ therapistId: string }> }
) {
  try {
    const { therapistId } = await params;
    const body = await request.json();
    const { appointment_id, session_date, duration_min } = body;

    if (!appointment_id) {
      return NextResponse.json(
        { success: false, error: 'appointment_id is required' },
        { status: 400 }
      );
    }

    // Verify the appointment belongs to this therapist
    const appointments: any[] = await query(
      `SELECT * FROM appointments WHERE appointment_id = ? AND therapist_id = ?`,
      [appointment_id, therapistId]
    );

    if (appointments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found or does not belong to this therapist' },
        { status: 404 }
      );
    }

    const appointment = appointments[0];

    // Check if session already exists
    const existingSessions: any[] = await query(
      `SELECT session_id FROM sessions WHERE appointment_id = ?`,
      [appointment_id]
    );

    if (existingSessions.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Session already exists for this appointment', session_id: existingSessions[0].session_id },
        { status: 409 }
      );
    }

    // Create session
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const defaultSessionDate = session_date || `${year}-${month}-${day}`;

    // Calculate duration from appointment times if not provided
    const startTime = new Date(`1970-01-01T${appointment.start_time}`);
    const endTime = new Date(`1970-01-01T${appointment.end_time}`);
    const calculatedDuration = duration_min || Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    const result: any = await query(
      `INSERT INTO sessions (appointment_id, session_date, duration_min)
       VALUES (?, ?, ?)`,
      [appointment_id, defaultSessionDate, calculatedDuration]
    );

    return NextResponse.json({
      success: true,
      session_id: result.insertId,
      message: 'Session created successfully',
      session: {
        session_id: result.insertId,
        appointment_id,
        session_date: defaultSessionDate,
        duration_min: calculatedDuration
      }
    });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
