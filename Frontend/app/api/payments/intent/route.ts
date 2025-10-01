import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { appointment_id, user_id } = await req.json();
    if (!appointment_id || !user_id) {
      return NextResponse.json({ ok: false, message: "appointment_id & user_id required" }, { status: 400 });
    }

    const [appt] = await query<any>(
      `
      SELECT a.appointment_id, a.user_id, a.therapist_id, a.start_time, a.end_time, a.status,
             t.name AS therapist_name, t.fees_min, t.fees_max
      FROM appointments a
      JOIN therapists t ON t.therapist_id = a.therapist_id
      WHERE a.appointment_id = ? AND a.user_id = ?
      `,
      [appointment_id, user_id]
    ) as any[];

    if (!appt) return NextResponse.json({ ok: false, message: "Appointment not found" }, { status: 404 });

    const existing = await query<any>(
      `SELECT * FROM payments WHERE appointment_id = ? AND user_id = ? ORDER BY payment_id DESC LIMIT 1`,
      [appointment_id, user_id]
    );

    if (existing.length && (existing[0].status === "init" || existing[0].status === "paid")) {
      return NextResponse.json({ ok: true, payment_id: existing[0].payment_id, amount: existing[0].amount, currency: existing[0].currency });
    }

    const amount = appt.fees_min ?? 1000;
    const currency = "BDT";

    const result: any = await query(
      `INSERT INTO payments (user_id, appointment_id, amount, currency, status, display_name)
       VALUES (?, ?, ?, ?, 'init', 'Choose Provider')`,
      [user_id, appointment_id, amount, currency]
    );

    return NextResponse.json({ ok: true, payment_id: result.insertId, amount, currency });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json({ ok: false, message: "Failed to create payment intent" }, { status: 500 });
  }
}
