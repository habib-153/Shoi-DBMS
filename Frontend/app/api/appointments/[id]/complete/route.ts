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

    // Session creation is now handled by the payment completion logic.
    // This endpoint is now only responsible for marking the appointment as completed.

    return NextResponse.json({
      success: true,
      message: 'Appointment marked as completed',
      appointment_id: appointmentId,
      appointment: {
        user_name: appointment.user_name,
        therapist_name: appointment.therapist_name,
        start_time: appointment.start_time,
        end_time: appointment.end_time
      }
    });
    
  } catch (error) {
    console.error('Error completing appointment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to complete appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
