import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Mark appointment as completed and create session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params;

    // Get appointment details
    const appointments: any[] = await query(
      `SELECT a.*, u.name as user_name, t.name as therapist_name
       FROM appointments a
       JOIN users u ON a.user_id = u.user_id
       JOIN therapists t ON a.therapist_id = t.therapist_id
       WHERE a.appointment_id = ?`,
      [appointmentId]
    );

    if (appointments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Appointment not found'
      }, { status: 404 });
    }

    const appointment = appointments[0];

    // Update appointment to completed
    await query(
      `UPDATE appointments SET status = 'completed' WHERE appointment_id = ?`,
      [appointmentId]
    );

    // Check if session already exists
    const existingSessions: any[] = await query(
      `SELECT session_id FROM sessions WHERE appointment_id = ?`,
      [appointmentId]
    );

    let sessionId: number;
    let sessionAlreadyExisted = false;

    if (existingSessions.length > 0) {
      // Session already exists - just return it
      sessionId = existingSessions[0].session_id;
      sessionAlreadyExisted = true;
      
      // Check if note exists for this session
      const existingNotes: any[] = await query(
        `SELECT note_id, summary, homework, therapist_private_notes 
         FROM session_notes WHERE session_id = ?`,
        [sessionId]
      );

      return NextResponse.json({
        success: true,
        message: sessionAlreadyExisted ? 'Session already exists for this appointment' : 'Appointment completed and session created',
        appointment_id: appointmentId,
        session_id: sessionId,
        session_already_existed: sessionAlreadyExisted,
        has_note: existingNotes.length > 0,
        note: existingNotes.length > 0 ? existingNotes[0] : null,
        appointment: {
          user_name: appointment.user_name,
          therapist_name: appointment.therapist_name,
          start_time: appointment.start_time,
          end_time: appointment.end_time
        }
      });
    } else {
      // Create session automatically
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const sessionDate = `${year}-${month}-${day}`;

      // Calculate duration
      const startTime = new Date(appointment.start_time);
      const endTime = new Date(appointment.end_time);
      const durationMin = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const result: any = await query(
        `INSERT INTO sessions (appointment_id, session_date, duration_min, status)
         VALUES (?, ?, ?, 'completed')`,
        [appointmentId, sessionDate, durationMin]
      );

      sessionId = result.insertId;
      
      return NextResponse.json({
        success: true,
        message: 'Appointment completed and session created',
        appointment_id: appointmentId,
        session_id: sessionId,
        session_already_existed: false,
        has_note: false,
        note: null,
        appointment: {
          user_name: appointment.user_name,
          therapist_name: appointment.therapist_name,
          start_time: appointment.start_time,
          end_time: appointment.end_time
        }
      });
    }

  } catch (error) {
    console.error('Error completing appointment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to complete appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
