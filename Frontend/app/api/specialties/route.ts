import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const rows = await query<{ specialty_id: number; name: string }>(
    "SELECT specialty_id, name FROM specialties ORDER BY name"
  );
  return NextResponse.json(rows);
}