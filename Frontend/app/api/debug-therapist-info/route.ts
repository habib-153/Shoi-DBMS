import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get all therapists
    const therapists = await query(`
      SELECT 
        therapist_id,
        user_id,
        name,
        email,
        specialization,
        created_at
      FROM therapists
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Check appointments table structure
    const tableStructure = await query(`
      DESCRIBE appointments
    `);

    // Sample appointments
    const sampleAppointments = await query(`
      SELECT * FROM appointments 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    return NextResponse.json({
      success: true,
      data: {
        therapists,
        appointmentsTableStructure: tableStructure,
        sampleAppointments,
        instructionsForUser: [
          "1. Copy your therapist_id from the therapists list above",
          "2. Open browser console (F12)",
          "3. Type: localStorage.getItem('therapist')",
          "4. Check if the therapist_id matches",
          "5. Visit: /api/therapists/YOUR_ID/appointments?status=confirmed,pending,scheduled"
        ]
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
