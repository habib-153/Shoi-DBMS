import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch payments with full relationships
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const appointmentId = searchParams.get('appointmentId');
    const status = searchParams.get('status');

    let sql = `
      SELECT 
        p.payment_id,
        p.user_id,
        p.appointment_id,
        p.amount,
        p.status as payment_status,
        p.payment_method,
        p.transaction_id,
        p.created_at,
        p.updated_at,
        u.name as user_name,
        u.email as user_email,
        a.start_time,
        a.end_time,
        a.status as appointment_status,
        t.name as therapist_name,
        t.fees_min,
        t.fees_max
      FROM payments p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN appointments a ON p.appointment_id = a.appointment_id
      LEFT JOIN therapists t ON a.therapist_id = t.therapist_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (userId) {
      sql += ` AND p.user_id = ?`;
      params.push(userId);
    }

    if (appointmentId) {
      sql += ` AND p.appointment_id = ?`;
      params.push(appointmentId);
    }

    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY p.created_at DESC`;

    const payments = await query(sql, params);

    return NextResponse.json({
      success: true,
      payments
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST - Create new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      appointment_id, 
      amount, 
      payment_method = 'online',
      transaction_id = null 
    } = body;

    if (!user_id || !amount) {
      return NextResponse.json(
        { success: false, error: 'User ID and amount are required' },
        { status: 400 }
      );
    }

    // Verify the appointment exists and belongs to the user
    if (appointment_id) {
      const appointment = await query(
        'SELECT * FROM appointments WHERE appointment_id = ? AND user_id = ?',
        [appointment_id, user_id]
      );

      if (appointment.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Appointment not found or does not belong to user' },
          { status: 404 }
        );
      }
    }

    // Get next payment_id (manual ID generation)
    const maxIdResult: any = await query(
      `SELECT MAX(payment_id) as max_id FROM payments`
    );
    const currentMaxId = maxIdResult[0]?.max_id || 0;
    const next_payment_id = currentMaxId + 1;

    // Create payment record
    const result: any = await query(
      `INSERT INTO payments (payment_id, user_id, appointment_id, amount, status, payment_method, transaction_id, created_at)
       VALUES (?, ?, ?, ?, 'pending', ?, ?, NOW())`,
      [next_payment_id, user_id, appointment_id || null, amount, payment_method, transaction_id]
    );

    return NextResponse.json({
      success: true,
      payment_id: next_payment_id,
      message: 'Payment created successfully'
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}