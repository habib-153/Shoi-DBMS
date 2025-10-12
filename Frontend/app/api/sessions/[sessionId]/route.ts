import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch specific session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await query(
      `SELECT 
        s.session_id,
        s.appointment_id,
        s.session_date,
        s.start_time,
        s.end_time,
        s.status,
        s.notes,
        s.duration_min,
        s.rating_by_user,
        s.next_actions,
        a.user_id,
        a.therapist_id,
        u.name as user_name,
        u.email as user_email,
        t.name as therapist_name,
        t.email as therapist_email
      FROM sessions s
      JOIN appointments a ON s.appointment_id = a.appointment_id
      JOIN users u ON a.user_id = u.user_id
      JOIN therapists t ON a.therapist_id = t.therapist_id
      WHERE s.session_id = ?`,
      [sessionId]
    );

    if (session.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: session[0]
    });

  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// PUT - Update session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { 
      status, 
      notes, 
      duration_min, 
      next_actions,
      session_date,
      start_time,
      end_time 
    } = body;

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }
    if (duration_min) {
      updateFields.push('duration_min = ?');
      updateValues.push(duration_min);
    }
    if (next_actions !== undefined) {
      updateFields.push('next_actions = ?');
      updateValues.push(next_actions);
    }
    if (session_date) {
      updateFields.push('session_date = ?');
      updateValues.push(session_date);
    }
    if (start_time) {
      updateFields.push('start_time = ?');
      updateValues.push(start_time);
    }
    if (end_time) {
      updateFields.push('end_time = ?');
      updateValues.push(end_time);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields provided for update' },
        { status: 400 }
      );
    }

    updateValues.push(sessionId);

    await query(
      `UPDATE sessions SET ${updateFields.join(', ')}, updated_at = NOW() WHERE session_id = ?`,
      updateValues
    );

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully'
    });

  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE - Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // First delete any session notes
    await query('DELETE FROM session_notes WHERE session_id = ?', [sessionId]);
    
    // Then delete the session
    await query('DELETE FROM sessions WHERE session_id = ?', [sessionId]);

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}