import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const therapistId = Number(req.nextUrl.searchParams.get("therapist_id"));
  const date = req.nextUrl.searchParams.get("date");
  if (!therapistId || !date) return NextResponse.json([]);

  const taken = await query<{ start_time: string; end_time: string }>(
    `
    SELECT start_time, end_time
    FROM appointments
    WHERE therapist_id = ?
      AND DATE(start_time) = ?
      AND status IN ('pending','confirmed','paid')
    `,
    [therapistId, date]
  );

  const start = dayjs(`${date} 09:00`);
  const end = dayjs(`${date} 20:00`);
  const slots: { start: string; end: string }[] = [];

  let t = start;
  while (t.isBefore(end)) {
    const s = t;
    const e = t.add(60, "minute");
    const clash = taken.some(a => s.isBefore(dayjs(a.end_time)) && e.isAfter(dayjs(a.start_time)));
    if (!clash) {
      slots.push({ start: s.format("YYYY-MM-DD HH:mm:ss"), end: e.format("YYYY-MM-DD HH:mm:ss") });
    }
    t = e;
  }

  return NextResponse.json(slots);
}
