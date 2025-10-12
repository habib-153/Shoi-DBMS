import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    // Get all sessions between the therapist and specific user
    const sessions = await query(`
      SELECT 
        s.*,
        u.name as user_name,
        u.email as user_email,
        t.name as therapist_name,
        a.start_time,
        a.end_time,
        a.status as appointment_status
      FROM sessions s
      JOIN appointments a ON s.appointment_id = a.appointment_id
      JOIN users u ON a.user_id = u.user_id
      JOIN therapists t ON a.therapist_id = t.therapist_id
      WHERE a.user_id = ?
      ORDER BY s.session_date DESC
    `, [userId]);

    // Get session notes for each session
    const sessionsWithNotes = await Promise.all(
      (sessions as any[]).map(async (session) => {
        const notes = await query(`
          SELECT * FROM session_notes 
          WHERE session_id = ? 
          ORDER BY created_at DESC
        `, [session.session_id]);
        
        return {
          ...session,
          notes
        };
      })
    );

    return NextResponse.json({
      success: true,
      sessions: sessionsWithNotes
    });

  } catch (error) {
    console.error('Error fetching therapist sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}