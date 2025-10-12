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

    // Update payment record with only the columns that exist
    await query(
      `UPDATE payments SET status = ? WHERE payment_id = ?`,
      [status, paymentId]
    );

    console.log('Payment updated successfully');

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
