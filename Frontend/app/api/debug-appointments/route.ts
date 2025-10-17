import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get all appointments
    const appointments = await query(
      `SELECT 
        a.appointment_id,
        a.user_id,
        a.therapist_id,
        a.start_time,
        a.status,
        t.name as therapist_name,
        p.payment_id,
        p.status as payment_status,
        p.amount as payment_amount,
        s.session_id,
        sn.note_id
      FROM appointments a
      LEFT JOIN therapists t ON a.therapist_id = t.therapist_id
      LEFT JOIN payments p ON a.appointment_id = p.appointment_id
      LEFT JOIN sessions s ON a.appointment_id = s.appointment_id
      LEFT JOIN session_notes sn ON s.session_id = sn.session_id
      ORDER BY a.appointment_id DESC
      LIMIT 20`
    );
    
    // Get users
    const users = await query('SELECT user_id, name, email FROM users ORDER BY user_id DESC LIMIT 10');
    
    // Get sessions
    const sessions = await query('SELECT * FROM sessions ORDER BY session_id DESC LIMIT 10');
    
    // Get session notes
    const sessionNotes = await query('SELECT * FROM session_notes ORDER BY note_id DESC LIMIT 10');
    
    return NextResponse.json({
      success: true,
      appointments,
      users,
      sessions,
      sessionNotes,
      counts: {
        appointments: appointments.length,
        users: users.length,
        sessions: sessions.length,
        sessionNotes: sessionNotes.length
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch debug data',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
