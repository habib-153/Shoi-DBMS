import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  appointment_id: z.number(),
  user_id: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    console.log('Payment intent request:', json);
    const parsed = Body.parse(json);

    // First check if appointment exists
    const appointments = await query(
      `SELECT * FROM appointments WHERE appointment_id = ? AND user_id = ?`,
      [parsed.appointment_id, parsed.user_id]
    );

    console.log('Found appointments:', appointments);

    if (appointments.length === 0) {
      return NextResponse.json({ 
        ok: false, 
        message: "Appointment not found" 
      }, { status: 404 });
    }

    const appointment = appointments[0];
    
    // Calculate payment amount (default to 1500 BDT)
    const amount = 1500;
    console.log('Creating payment with amount:', amount);

    // Get next payment_id (since it's not AUTO_INCREMENT)
    const maxPaymentId: any = await query(
      `SELECT IFNULL(MAX(payment_id), 0) + 1 as next_id FROM payments`
    );
    const nextPaymentId = maxPaymentId[0]?.next_id || 1;

    // Create payment record with payment_id
    const result: any = await query(
      `INSERT INTO payments (payment_id, appointment_id, user_id, amount, currency, status) VALUES (?, ?, ?, ?, 'BDT', 'pending')`,
      [nextPaymentId, parsed.appointment_id, parsed.user_id, amount]
    );

    return NextResponse.json({ 
      ok: true, 
      payment_id: nextPaymentId,
      amount: amount,
      currency: 'BDT',
      appointment_details: {
        appointment_id: appointment.appointment_id,
        start_time: appointment.start_time,
        end_time: appointment.end_time
      },
      message: "Payment intent created successfully" 
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : "Failed to create payment intent",
      message: "Failed to create payment intent" 
    }, { status: 500 });
  }
}
