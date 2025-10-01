import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { payment_id, provider, provider_ref } = await req.json();

  if (!payment_id || !provider || !provider_ref) {
    return NextResponse.json({ ok: false, message: "payment_id, provider & provider_ref required" }, { status: 400 });
  }

  const [pay] = await query<any>(
    `SELECT * FROM payments WHERE payment_id = ? LIMIT 1`,
    [payment_id]
  ) as any[];

  if (!pay) return NextResponse.json({ ok: false, message: "Payment not found" }, { status: 404 });
  if (pay.status === "paid") return NextResponse.json({ ok: true, alreadyPaid: true });

  await query(
    `UPDATE payments SET status='paid', display_name=?, provider_ref=?, paid_at=NOW() WHERE payment_id=?`,
    [provider, provider_ref, payment_id]
  );

  if (pay.appointment_id) {
    await query(`UPDATE appointments SET status='paid' WHERE appointment_id=?`, [pay.appointment_id]);
  }

  return NextResponse.json({ ok: true, appointment_id: pay.appointment_id });
}
