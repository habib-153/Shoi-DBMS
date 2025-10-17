import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Create session note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { summary, homework, therapist_private_notes, visible_to_user, therapist_id } = body;

    if (!summary && !homework && !therapist_private_notes) {
      return NextResponse.json(
        { success: false, error: 'At least one field (summary, homework, or private notes) is required' },
        { status: 400 }
      );
    }

    // Verify the session exists and get full details including user_id, therapist_id, appointment_id
    const sessions: any[] = await query(
      `SELECT 
        s.session_id, 
        s.appointment_id,
        a.user_id,
        a.therapist_id,
        a.start_time,
        a.end_time,
        u.name as user_name,
        t.name as therapist_name
       FROM sessions s
       JOIN appointments a ON s.appointment_id = a.appointment_id
       JOIN users u ON a.user_id = u.user_id
       JOIN therapists t ON a.therapist_id = t.therapist_id
       WHERE s.session_id = ?`,
      [sessionId]
    );

    if (sessions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessions[0];

    // OPTIONAL: Validate therapist if therapist_id is provided
    // If not provided, we trust the session's therapist_id
    if (therapist_id && session.therapist_id !== parseInt(therapist_id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Session ${sessionId} belongs to therapist ${session.therapist_name} (ID: ${session.therapist_id}), not therapist ID ${therapist_id}`,
          details: {
            session_id: session.session_id,
            appointment_id: session.appointment_id,
            appointment_time: `${session.start_time} - ${session.end_time}`,
            correct_therapist_id: session.therapist_id,
            correct_therapist_name: session.therapist_name,
            patient_id: session.user_id,
            patient_name: session.user_name
          }
        },
        { status: 403 }
      );
    }

    // Check if a note already exists for this session
    const existingNotes: any[] = await query(
      'SELECT note_id FROM session_notes WHERE session_id = ? ORDER BY created_at DESC LIMIT 1',
      [sessionId]
    );

    let noteId: number;
    let message: string;

    if (existingNotes.length > 0) {
      // Update the existing note
      noteId = existingNotes[0].note_id;
      await query(
        `UPDATE session_notes 
         SET summary = ?, 
             homework = ?, 
             therapist_private_notes = ?, 
             visible_to_user = ?,
             created_at = NOW()
         WHERE note_id = ?`,
        [
          summary || null,
          homework || null,
          therapist_private_notes || null,
          visible_to_user !== undefined ? visible_to_user : 1,
          noteId
        ]
      );
      message = 'Session note updated successfully';
    } else {
      // Get next note_id
      const maxNoteId: any = await query(
        `SELECT IFNULL(MAX(note_id), 0) + 1 as next_id FROM session_notes`
      );
      const nextNoteId = maxNoteId[0]?.next_id || 1;
      
      // Create a new session note
      const result: any = await query(
        `INSERT INTO session_notes 
          (note_id, session_id, summary, homework, therapist_private_notes, visible_to_user)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          nextNoteId,
          sessionId,
          summary || null,
          homework || null,
          therapist_private_notes || null,
          visible_to_user !== undefined ? visible_to_user : 1 // Default to visible
        ]
      );
      noteId = nextNoteId;
      message = 'Session note created successfully';
    }

    return NextResponse.json({
      success: true,
      note_id: noteId,
      message: message,
      session_details: {
        session_id: session.session_id,
        appointment_id: session.appointment_id,
        therapist_id: session.therapist_id,
        therapist_name: session.therapist_name,
        user_id: session.user_id,
        user_name: session.user_name
      }
    });

  } catch (error) {
    console.error('Error creating session note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session note', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Get session notes for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    // Get viewer info from query params
    const { searchParams } = new URL(request.url);
    const viewerType = searchParams.get('viewer_type'); // 'user' or 'therapist'
    const viewerId = searchParams.get('viewer_id');

    const notes = await query(
      `SELECT 
        sn.note_id,
        sn.session_id,
        sn.summary,
        sn.homework,
        sn.therapist_private_notes,
        sn.visible_to_user,
        sn.created_at,
        s.session_id,
        s.session_date,
        s.duration_min,
        s.appointment_id,
        a.appointment_id,
        a.user_id,
        a.therapist_id,
        a.start_time,
        a.end_time,
        a.status as appointment_status,
        u.name as user_name,
        u.email as user_email,
        t.name as therapist_name,
        t.email as therapist_email
       FROM session_notes sn
       JOIN sessions s ON sn.session_id = s.session_id
       JOIN appointments a ON s.appointment_id = a.appointment_id
       JOIN users u ON a.user_id = u.user_id
       JOIN therapists t ON a.therapist_id = t.therapist_id
       WHERE sn.session_id = ?
       ORDER BY sn.created_at DESC`,
      [sessionId]
    );

    // Check shield mode for users
    if (viewerType === 'user' && viewerId && notes.length > 0) {
      const userId = notes[0].user_id;
      const [privacySettings]: any = await query(
        `SELECT shield_mode FROM privacy_settings WHERE user_id = ?`,
        [userId]
      );
      
      if (privacySettings.length > 0 && privacySettings[0].shield_mode === 1) {
        // Mask sensitive information in shield mode
        notes.forEach((note: any) => {
          if (note.therapist_private_notes) {
            note.therapist_private_notes = '[Protected by Shield Mode]';
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      notes
    });

  } catch (error) {
    console.error('Error fetching session notes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session notes' },
      { status: 500 }
    );
  }
}
