import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'shoi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: payment_id } = await params;
    const body = await request.json();
    const { payment_method } = body;

    if (!payment_id || !payment_method) {
      return NextResponse.json({ 
        ok: false,
        error: 'Payment ID and payment method are required' 
      }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Simulate payment processing (in real app, you'd integrate with payment gateway)
    const success = Math.random() > 0.1; // 90% success rate for demo

    if (success) {
      // Update payment status
      await connection.execute(
        `UPDATE payments 
         SET status = 'completed', 
             payment_method = ?,
             completed_at = NOW()
         WHERE payment_id = ?`,
        [payment_method, payment_id]
      );

      // Update appointment status
      await connection.execute(
        `UPDATE appointments a
         JOIN payments p ON a.appointment_id = p.appointment_id
         SET a.status = 'confirmed'
         WHERE p.payment_id = ?`,
        [payment_id]
      );

      await connection.end();

      return NextResponse.json({
        ok: true,
        message: 'Payment processed successfully',
        status: 'completed'
      });
    } else {
      // Update payment status to failed
      await connection.execute(
        `UPDATE payments 
         SET status = 'failed',
             payment_method = ?
         WHERE payment_id = ?`,
        [payment_method, payment_id]
      );

      await connection.end();

      return NextResponse.json({
        ok: false,
        error: 'Payment processing failed. Please try again.',
        status: 'failed'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Payment processing API error:', error);
    return NextResponse.json({ 
      ok: false,
      error: 'Failed to process payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}