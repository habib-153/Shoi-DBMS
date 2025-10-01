import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const paymentId = Number(req.nextUrl.searchParams.get("payment_id"));
  if (!paymentId) return NextResponse.json({ ok: false, message: "payment_id required" }, { status: 400 });

  const [row] = await query<any>(
    `
    SELECT p.payment_id, p.amount, p.currency, p.status, p.provider_ref, p.display_name,
           a.appointment_id, a.start_time, a.end_time, a.status AS appointment_status,
           t.name AS therapist_name
    FROM payments p
    LEFT JOIN appointments a ON a.appointment_id = p.appointment_id
    LEFT JOIN therapists t ON t.therapist_id = a.therapist_id
    WHERE p.payment_id = ?
    `,
    [paymentId]
  ) as any[];

  if (!row) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, data: row });
}
