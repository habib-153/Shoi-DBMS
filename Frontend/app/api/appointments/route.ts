import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  user_id: z.number(),
  therapist_id: z.number(),
  start_time: z.string(), // "YYYY-MM-DD HH:mm:ss"
  end_time: z.string(),
  status: z.string().optional(), // Optional status field
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    console.log('Received appointment request:', json); // Debug log
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

    // Get next appointment_id (manual ID generation with better error handling)
    const maxIdResult: any = await query(
      `SELECT MAX(appointment_id) as max_id FROM appointments`
    );
    
    console.log('Max ID result:', maxIdResult);
    
    const currentMaxId = maxIdResult[0]?.max_id || 0;
    const next_appointment_id = currentMaxId + 1;
    
    console.log('Current max appointment_id:', currentMaxId);
    console.log('Next appointment_id will be:', next_appointment_id);

    // Use provided status or default to 'pending'
    const appointmentStatus = parsed.status || 'pending';
    console.log('Creating appointment with status:', appointmentStatus);

    const result: any = await query(
      `INSERT INTO appointments (appointment_id, user_id, therapist_id, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [next_appointment_id, parsed.user_id, parsed.therapist_id, parsed.start_time, parsed.end_time, appointmentStatus]
    );

    console.log('Database insert result:', result);
    console.log('Created appointment with ID:', next_appointment_id);

    return NextResponse.json({ 
      ok: true, 
      appointment_id: next_appointment_id, 
      message: "Appointment created successfully" 
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    
    // Better error handling for Zod validation errors
    if (error instanceof z.ZodError) {
      console.error("Validation error details:", error.issues);
      return NextResponse.json({ 
        ok: false, 
        message: "Invalid appointment data: " + error.issues.map(e => e.message).join(', ')
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      ok: false, 
      message: "Failed to create appointment",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
