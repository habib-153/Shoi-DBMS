import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const therapistId = searchParams.get('therapist_id');
    const sessionId = searchParams.get('session_id');
    const appointmentId = searchParams.get('appointment_id');
    const noteId = searchParams.get('note_id');

    let results: any = {};

    // If note_id provided, trace back to all connected IDs
    if (noteId) {
      const noteData = await query(`
        SELECT 
          sn.note_id,
          sn.session_id,
          sn.summary,
          sn.homework,
          sn.visible_to_user,
          sn.created_at,
          s.appointment_id,
          s.session_date,
          s.duration_min,
          a.user_id,
          a.therapist_id,
          a.status as appointment_status,
          a.start_time,
          a.end_time,
          u.name as user_name,
          u.email as user_email,
          t.name as therapist_name,
          t.email as therapist_email
        FROM session_notes sn
        JOIN sessions s ON sn.session_id = s.session_id
        JOIN appointments a ON s.appointment_id = a.appointment_id
        JOIN users u ON a.user_id = u.user_id
        JOIN therapists t ON a.therapist_id = t.therapist_id
        WHERE sn.note_id = ?
      `, [noteId]);

      results.note_trace = noteData[0] || null;
    }

    // If session_id provided, get session details and all related notes
    if (sessionId) {
      const sessionData = await query(`
        SELECT 
          s.session_id,
          s.appointment_id,
          s.session_date,
          s.duration_min,
          a.user_id,
          a.therapist_id,
          a.status,
          u.name as user_name,
          t.name as therapist_name,
          COUNT(sn.note_id) as note_count
        FROM sessions s
        JOIN appointments a ON s.appointment_id = a.appointment_id
        JOIN users u ON a.user_id = u.user_id
        JOIN therapists t ON a.therapist_id = t.therapist_id
        LEFT JOIN session_notes sn ON s.session_id = sn.session_id
        WHERE s.session_id = ?
        GROUP BY s.session_id
      `, [sessionId]);

      const notes = await query(`
        SELECT note_id, summary, homework, visible_to_user, created_at
        FROM session_notes
        WHERE session_id = ?
        ORDER BY created_at DESC
      `, [sessionId]);

      results.session_trace = {
        session: sessionData[0] || null,
        notes: notes
      };
    }

    // If appointment_id provided, get all sessions and notes
    if (appointmentId) {
      const appointmentData = await query(`
        SELECT 
          a.appointment_id,
          a.user_id,
          a.therapist_id,
          a.start_time,
          a.end_time,
          a.status,
          u.name as user_name,
          t.name as therapist_name,
          COUNT(DISTINCT s.session_id) as session_count,
          COUNT(sn.note_id) as total_notes
        FROM appointments a
        JOIN users u ON a.user_id = u.user_id
        JOIN therapists t ON a.therapist_id = t.therapist_id
        LEFT JOIN sessions s ON a.appointment_id = s.appointment_id
        LEFT JOIN session_notes sn ON s.session_id = sn.session_id
        WHERE a.appointment_id = ?
        GROUP BY a.appointment_id
      `, [appointmentId]);

      const sessions = await query(`
        SELECT 
          s.session_id,
          s.session_date,
          s.duration_min,
          COUNT(sn.note_id) as note_count
        FROM sessions s
        LEFT JOIN session_notes sn ON s.session_id = sn.session_id
        WHERE s.appointment_id = ?
        GROUP BY s.session_id
      `, [appointmentId]);

      results.appointment_trace = {
        appointment: appointmentData[0] || null,
        sessions: sessions
      };
    }

    // If user_id provided, get all their appointments, sessions, and notes
    if (userId) {
      const userData = await query(`
        SELECT 
          u.user_id,
          u.name,
          u.email,
          COUNT(DISTINCT a.appointment_id) as appointment_count,
          COUNT(DISTINCT s.session_id) as session_count,
          COUNT(sn.note_id) as total_notes
        FROM users u
        LEFT JOIN appointments a ON u.user_id = a.user_id
        LEFT JOIN sessions s ON a.appointment_id = s.appointment_id
        LEFT JOIN session_notes sn ON s.session_id = sn.session_id
        WHERE u.user_id = ?
        GROUP BY u.user_id
      `, [userId]);

      const recentNotes = await query(`
        SELECT 
          sn.note_id,
          sn.session_id,
          s.appointment_id,
          t.name as therapist_name,
          sn.summary,
          sn.created_at
        FROM session_notes sn
        JOIN sessions s ON sn.session_id = s.session_id
        JOIN appointments a ON s.appointment_id = a.appointment_id
        JOIN therapists t ON a.therapist_id = t.therapist_id
        WHERE a.user_id = ?
        ORDER BY sn.created_at DESC
        LIMIT 10
      `, [userId]);

      results.user_trace = {
        user: userData[0] || null,
        recent_notes: recentNotes
      };
    }

    // If therapist_id provided, get all their appointments, sessions, and notes
    if (therapistId) {
      const therapistData = await query(`
        SELECT 
          t.therapist_id,
          t.name,
          t.email,
          COUNT(DISTINCT a.appointment_id) as appointment_count,
          COUNT(DISTINCT s.session_id) as session_count,
          COUNT(sn.note_id) as total_notes
        FROM therapists t
        LEFT JOIN appointments a ON t.therapist_id = a.therapist_id
        LEFT JOIN sessions s ON a.appointment_id = s.appointment_id
        LEFT JOIN session_notes sn ON s.session_id = sn.session_id
        WHERE t.therapist_id = ?
        GROUP BY t.therapist_id
      `, [therapistId]);

      const recentNotes = await query(`
        SELECT 
          sn.note_id,
          sn.session_id,
          s.appointment_id,
          u.name as user_name,
          sn.summary,
          sn.created_at
        FROM session_notes sn
        JOIN sessions s ON sn.session_id = s.session_id
        JOIN appointments a ON s.appointment_id = a.appointment_id
        JOIN users u ON a.user_id = u.user_id
        WHERE a.therapist_id = ?
        ORDER BY sn.created_at DESC
        LIMIT 10
      `, [therapistId]);

      results.therapist_trace = {
        therapist: therapistData[0] || null,
        recent_notes: recentNotes
      };
    }

    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error: any) {
    console.error("Error tracing IDs:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
