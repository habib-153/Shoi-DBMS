import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch sessions for a specific appointment
export async function GET(
  request: NextRequest,  
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointmentId = id;

    const sessions = await query(`
      SELECT 
        s.session_id,
        s.appointment_id,
        s.session_date,
        s.duration_min,
        s.rating_by_user,
        s.next_actions,
        a.user_id,
        a.therapist_id,
        u.name as user_name,
        t.name as therapist_name
      FROM sessions s
      JOIN appointments a ON s.appointment_id = a.appointment_id
      JOIN users u ON a.user_id = u.user_id
      JOIN therapists t ON a.therapist_id = t.therapist_id
      WHERE s.appointment_id = ?
      ORDER BY s.session_date DESC
    `, [appointmentId]);

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

// POST - Create new session for an appointment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointmentId = id;
    const body = await request.json();
    const { session_date, duration_min, rating_by_user, next_actions } = body;

    if (!session_date) {
      return NextResponse.json(
        { success: false, error: 'Session date is required' },
        { status: 400 }
      );
    }

    // Get next session_id
    const maxSessionId: any = await query(
      `SELECT IFNULL(MAX(session_id), 0) + 1 as next_id FROM sessions`
    );
    const nextSessionId = maxSessionId[0]?.next_id || 1;

    const result = await query(
      `INSERT INTO sessions (session_id, appointment_id, session_date, duration_min, rating_by_user, next_actions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nextSessionId, appointmentId, session_date, duration_min || null, rating_by_user || null, next_actions || null]
    );

    return NextResponse.json({
      success: true,
      session_id: nextSessionId,
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