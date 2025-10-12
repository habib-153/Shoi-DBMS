import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch therapist's appointments with patient relationships
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const therapistId = id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');

    let sql = `
      SELECT 
        a.appointment_id,
        a.user_id,
        a.therapist_id,
        a.start_time,
        a.end_time,
        a.status,
        a.created_at,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        u.date_of_birth,
        u.gender,
        t.name as therapist_name,
        t.fees_min,
        t.fees_max,
        p.payment_id,
        p.status as payment_status,
        p.amount as payment_amount
      FROM appointments a
      JOIN users u ON a.user_id = u.user_id
      JOIN therapists t ON a.therapist_id = t.therapist_id
      LEFT JOIN payments p ON a.appointment_id = p.appointment_id
      WHERE a.therapist_id = ?
    `;

    const params_array: any[] = [therapistId];

    if (status) {
      sql += ` AND a.status = ?`;
      params_array.push(status);
    }

    if (date) {
      sql += ` AND DATE(a.start_time) = ?`;
      params_array.push(date);
    }

    if (userId) {
      sql += ` AND a.user_id = ?`;
      params_array.push(userId);
    }

    sql += ` ORDER BY a.start_time ASC`;

    const appointments = await query(sql, params_array);

    // Get session counts for each appointment's user
    const appointmentsWithSessions = await Promise.all(
      appointments.map(async (appointment: any) => {
        const sessionCount = await query(
          `SELECT COUNT(*) as session_count 
           FROM sessions s 
           JOIN appointments ap ON s.appointment_id = ap.appointment_id 
           WHERE ap.user_id = ? AND ap.therapist_id = ?`,
          [appointment.user_id, therapistId]
        );

        return {
          ...appointment,
          total_sessions: sessionCount[0]?.session_count || 0
        };
      })
    );

    // Group by time ranges if requested
    const grouped = {
      upcoming: appointmentsWithSessions.filter((a: any) => new Date(a.start_time) > new Date() && a.status !== 'cancelled'),
      today: appointmentsWithSessions.filter((a: any) => {
        const today = new Date().toDateString();
        return new Date(a.start_time).toDateString() === today && a.status !== 'cancelled';
      }),
      past: appointmentsWithSessions.filter((a: any) => new Date(a.start_time) < new Date()),
      all: appointmentsWithSessions
    };

    return NextResponse.json({
      success: true,
      appointments: grouped.all,
      grouped: grouped,
      stats: {
        total: appointmentsWithSessions.length,
        upcoming: grouped.upcoming.length,
        today: grouped.today.length,
        completed: appointmentsWithSessions.filter((a: any) => a.status === 'completed').length,
        cancelled: appointmentsWithSessions.filter((a: any) => a.status === 'cancelled').length
      }
    });

  } catch (error) {
    console.error('Error fetching therapist appointments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch therapist appointments' },
      { status: 500 }
    );
  }
}

// POST - Create new appointment for therapist (typically from admin or booking system)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const therapistId = id;
    const body = await request.json();
    const { user_id, start_time, end_time, session_type, notes } = body;

    if (!user_id || !start_time || !end_time) {
      return NextResponse.json(
        { success: false, error: 'User ID, start time, and end time are required' },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts
    const conflicts = await query(
      `SELECT appointment_id FROM appointments 
       WHERE therapist_id = ? 
       AND ((start_time < ? AND end_time > ?) OR (start_time >= ? AND start_time < ?))
       AND status IN ('pending', 'confirmed', 'paid', 'scheduled')`,
      [therapistId, end_time, start_time, start_time, end_time]
    );

    if (conflicts.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Time slot conflict detected' },
        { status: 409 }
      );
    }

    // Create appointment
    const result: any = await query(
      `INSERT INTO appointments (user_id, therapist_id, start_time, end_time, session_type, notes, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled', NOW())`,
      [user_id, therapistId, start_time, end_time, session_type || 'consultation', notes || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Appointment created successfully',
      appointment_id: result.insertId || result[0]?.insertId
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}