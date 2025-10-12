import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const sessionsStructure = await query('DESCRIBE sessions');
    const appointmentsStructure = await query('DESCRIBE appointments');
    const sessionNotesStructure = await query('DESCRIBE session_notes');
    
    // Get sample data
    const sampleSessions = await query('SELECT * FROM sessions LIMIT 2');
    const sampleAppointments = await query('SELECT * FROM appointments LIMIT 2');
    const sampleNotes = await query('SELECT * FROM session_notes LIMIT 2');
    
    return NextResponse.json({
      success: true,
      tables: {
        sessions: {
          structure: sessionsStructure,
          sample: sampleSessions
        },
        appointments: {
          structure: appointmentsStructure,
          sample: sampleAppointments
        },
        session_notes: {
          structure: sessionNotesStructure,
          sample: sampleNotes
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
