import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // Create a test session for session notes to work
    const existingSessions = await query('SELECT COUNT(*) as count FROM sessions');
    const sessionCount = (existingSessions as any)[0].count;
    
    if (sessionCount === 0) {
      // First create a test appointment
      const appointmentResult = await query(`
        INSERT INTO appointments (user_id, therapist_id, appointment_date, start_time, end_time, status, appointment_type)
        VALUES (1, 1, CURDATE(), '10:00:00', '11:00:00', 'completed', 'therapy_session')
      `);
      
      const appointmentId = (appointmentResult as any).insertId;
      
      // Then create a session
      const sessionResult = await query(`
        INSERT INTO sessions (appointment_id, user_id, therapist_id, session_date, duration_min, session_type)
        VALUES (?, 1, 1, CURDATE(), 60, 'therapy_session')
      `, [appointmentId]);
      
      const sessionId = (sessionResult as any).insertId;
      
      return NextResponse.json({
        success: true,
        message: 'Test session created',
        sessionId,
        appointmentId
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Sessions already exist',
        sessionCount
      });
    }
    
  } catch (error) {
    console.error('Error creating test session:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}