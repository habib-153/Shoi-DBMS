import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all sessions with relationships
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');
    const userId = searchParams.get('userId');
    const therapistId = searchParams.get('therapistId');

    let sql = `
      SELECT 
        s.session_id,
        s.appointment_id,
        s.session_date,
        s.duration_min,
        s.rating_by_user,
        s.next_actions,
        a.user_id,
        a.therapist_id,
        a.start_time as appointment_start,
        a.end_time as appointment_end,
        a.status as appointment_status,
        u.name as user_name,
        u.email as user_email,
        t.name as therapist_name,
        t.email as therapist_email
      FROM sessions s
      JOIN appointments a ON s.appointment_id = a.appointment_id
      JOIN users u ON a.user_id = u.user_id
      JOIN therapists t ON a.therapist_id = t.therapist_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (appointmentId) {
      sql += ` AND s.appointment_id = ?`;
      params.push(appointmentId);
    }

    if (userId) {
      sql += ` AND a.user_id = ?`;
      params.push(userId);
    }

    if (therapistId) {
      sql += ` AND a.therapist_id = ?`;
      params.push(therapistId);
    }

    sql += ` ORDER BY s.session_date DESC, a.start_time DESC`;

    const sessions = await query(sql, params);

    return NextResponse.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST - Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      appointment_id, 
      session_date, 
      start_time, 
      end_time, 
      status = 'scheduled',
      notes = null,
      duration_min = null
    } = body;

    if (!appointment_id || !session_date) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID and session date are required' },
        { status: 400 }
      );
    }

    // Verify appointment exists
    const appointment = await query(
      'SELECT * FROM appointments WHERE appointment_id = ?',
      [appointment_id]
    );

    if (appointment.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Create session
    const result: any = await query(
      `INSERT INTO sessions (appointment_id, session_date, start_time, end_time, status, notes, duration_min)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [appointment_id, session_date, start_time, end_time, status, notes, duration_min]
    );

    return NextResponse.json({
      success: true,
      session_id: result.insertId || null,
      message: 'Session created successfully'
    });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}