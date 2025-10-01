import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  user_id: z.number(),
  therapist_id: z.number(),
  start_time: z.string(), // "YYYY-MM-DD HH:mm:ss"
  end_time: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = Body.parse(json);

    // clash check
    const [{ c: clashCount }] = await query<{ c: number }>(
      `
      SELECT COUNT(*) as c
      FROM appointments
      WHERE therapist_id = ?
        AND ((start_time < ? AND end_time > ?) OR (start_time >= ? AND start_time < ?))
        AND status IN ('pending','confirmed','paid')
      `,
      [parsed.therapist_id, parsed.end_time, parsed.start_time, parsed.start_time, parsed.end_time]
    );

    if (clashCount > 0) {
      return NextResponse.json({ ok: false, message: "This time slot is no longer available" }, { status: 409 });
    }

    const result: any = await query(
      `INSERT INTO appointments (user_id, therapist_id, start_time, end_time, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [parsed.user_id, parsed.therapist_id, parsed.start_time, parsed.end_time]
    );

    return NextResponse.json({ ok: true, appointment_id: result.insertId, message: "Appointment created successfully" });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ ok: false, message: "Failed to create appointment" }, { status: 500 });
  }
}
