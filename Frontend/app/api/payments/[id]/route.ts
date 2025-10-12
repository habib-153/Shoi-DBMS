import { NextRequest, NextResponse } from 'next/server';
import { query } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const resolvedParams = await params;
    const paymentId = resolvedParams.id;

    console.log('Updating payment:', paymentId, 'to status:', status);

    // Update payment record with the correct column name
    await query(
      `UPDATE payments SET status = ? WHERE payment_id = ?`,
      [status, paymentId]
    );

    console.log('Payment updated successfully');

    // If payment is successful, create a session
    if (status === 'completed' || status === 'paid') {
      console.log('Payment successful, creating session...');

      // 1. Get appointment_id from payment
      const paymentResult: any[] = await query(
        `SELECT appointment_id FROM payments WHERE payment_id = ?`,
        [paymentId]
      );

      if (paymentResult.length > 0 && paymentResult[0].appointment_id) {
        const appointmentId = paymentResult[0].appointment_id;
        console.log(`Found appointment_id: ${appointmentId}`);

        // 2. Get appointment details
        const appointmentResult: any[] = await query(
          `SELECT * FROM appointments WHERE appointment_id = ?`,
          [appointmentId]
        );

        if (appointmentResult.length > 0) {
          const appointment = appointmentResult[0];
          console.log('Found appointment:', appointment);

          // 3. Check if a session already exists to prevent duplicates
          const existingSession: any[] = await query(
            `SELECT session_id FROM sessions WHERE appointment_id = ?`,
            [appointmentId]
          );

          if (existingSession.length === 0) {
            // 4. Create a session
            const startTime = new Date(`1970-01-01T${appointment.start_time}Z`);
            const endTime = new Date(`1970-01-01T${appointment.end_time}Z`);
            const durationMin = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // Duration in minutes

            // Extract just the date part from start_time
            const sessionDate = new Date(appointment.start_time).toISOString().split('T')[0];

            const sessionInsertResult = await query(
              `INSERT INTO sessions (appointment_id, session_date, duration_min)
               VALUES (?, ?, ?)`,
              [
                appointment.appointment_id,
                sessionDate,
                durationMin
              ]
            );
            console.log('Session created successfully:', sessionInsertResult);
          } else {
            console.log(`Session already exists for appointment_id: ${appointmentId}. Skipping creation.`);
          }
        } else {
          console.log(`No appointment found for appointment_id: ${appointmentId}`);
        }
      } else {
        console.log(`No appointment_id found for payment_id: ${paymentId}`);
      }
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Payment updated successfully' 
    });

  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Failed to update payment' 
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const paymentId = resolvedParams.id;

    const payments = await query(
      `SELECT * FROM payments WHERE payment_id = ?`,
      [paymentId]
    );

    if (payments.length === 0) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Payment not found' 
      }, { status: 404 });
    }

    return NextResponse.json(payments[0]);

  } catch (error) {
    console.error('Payment fetch error:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Failed to fetch payment' 
    }, { status: 500 });
  }
}
