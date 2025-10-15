import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Check if appointments table exists and what data it has
    const appointments = await query(`
      SELECT 
        a.appointment_id,
        a.therapist_id,
        a.user_id,
        a.start_time,
        a.end_time,
        a.status,
        a.created_at,
        u.name as user_name,
        t.name as therapist_name
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN therapists t ON a.therapist_id = t.therapist_id
      ORDER BY a.start_time DESC
      LIMIT 10
    `);

    // Get distinct statuses
    const statuses = await query(`
      SELECT DISTINCT status, COUNT(*) as count
      FROM appointments
      GROUP BY status
    `);

    // Get future appointments count
    const futureCount = await query(`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE start_time >= NOW()
    `);

    // Get therapist IDs that have appointments
    const therapistsWithAppts = await query(`
      SELECT DISTINCT therapist_id, COUNT(*) as appointment_count
      FROM appointments
      GROUP BY therapist_id
    `);

    return NextResponse.json({
      success: true,
      debug: {
        totalAppointments: appointments.length,
        recentAppointments: appointments,
        statusBreakdown: statuses,
        futureAppointmentsCount: futureCount[0],
        therapistsWithAppointments: therapistsWithAppts,
        currentTime: new Date().toISOString(),
      }
    });
  } catch (error: any) {
    console.error('Debug appointments error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
