import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get all patients for a therapist (based on appointments)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ therapistId: string }> }
) {
  try {
    const { therapistId } = await params;

    // Get all unique patients who have had appointments with this therapist
    const patients = await query(
      `SELECT DISTINCT
        u.user_id,
        u.name,
        u.email,
        COUNT(DISTINCT a.appointment_id) as total_appointments
      FROM users u
      INNER JOIN appointments a ON u.user_id = a.user_id
      WHERE a.therapist_id = ?
      GROUP BY u.user_id, u.name, u.email
      ORDER BY u.name ASC`,
      [therapistId]
    );

    return NextResponse.json({
      success: true,
      patients
    });

  } catch (error: any) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
