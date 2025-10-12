import { NextRequest, NextResponse } from 'next/server';
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params;

    const appointments = await query(
      `SELECT a.*, t.name as therapist_name, t.fees_min, t.fees_max
       FROM appointments a
       JOIN therapists t ON a.therapist_id = t.therapist_id
       WHERE a.appointment_id = ?`,
      [appointmentId]
    );

    if (appointments.length === 0) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Appointment not found' 
      }, { status: 404 });
    }

    return NextResponse.json(appointments[0]);

  } catch (error) {
    console.error('Appointment fetch error:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Failed to fetch appointment' 
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id: appointmentId } = await params;

    // Get appointment details
    const appointments: any[] = await query(
      `SELECT * FROM appointments WHERE appointment_id = ?`,
      [appointmentId]
    );

    if (appointments.length === 0) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Appointment not found' 
      }, { status: 404 });
    }

    const appointment = appointments[0];

    // Update appointment status
    await query(
      `UPDATE appointments 
       SET status = ?
       WHERE appointment_id = ?`,
      [status, appointmentId]
    );

    // If appointment is marked as completed, auto-create a session
    if (status === 'completed' && appointment.status !== 'completed') {
      // Check if session already exists
      const existingSessions: any[] = await query(
        `SELECT session_id FROM sessions WHERE appointment_id = ?`,
        [appointmentId]
      );

      if (existingSessions.length === 0) {
        // Create session automatically
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const sessionDate = `${year}-${month}-${day}`;

        // Calculate duration from appointment times
        const startTime = new Date(appointment.start_time);
        const endTime = new Date(appointment.end_time);
        const durationMin = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

        const sessionResult: any = await query(
          `INSERT INTO sessions (appointment_id, session_date, duration_min)
           VALUES (?, ?, ?)`,
          [appointmentId, sessionDate, durationMin]
        );

        console.log(`✅ Auto-created session ${sessionResult.insertId} for appointment ${appointmentId}`);
      }
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Appointment updated successfully' 
    });

  } catch (error) {
    console.error('Appointment update error:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Failed to update appointment' 
    }, { status: 500 });
  }
}
