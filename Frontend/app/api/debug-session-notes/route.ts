import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get all session notes with full details
    const allNotes = await query(`
      SELECT 
        sn.note_id,
        sn.session_id,
        sn.summary,
        sn.homework,
        sn.therapist_private_notes,
        sn.visible_to_user,
        sn.created_at,
        s.appointment_id,
        s.session_date,
        s.duration_min,
        a.user_id,
        a.therapist_id,
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
      ORDER BY sn.note_id DESC
      LIMIT 50
    `);

    // Check for duplicate note_ids
    const duplicates = await query(`
      SELECT note_id, COUNT(*) as count
      FROM session_notes
      GROUP BY note_id
      HAVING COUNT(*) > 1
    `);

    // Check for sessions with multiple notes
    const sessionDuplicates = await query(`
      SELECT session_id, COUNT(*) as note_count
      FROM session_notes
      GROUP BY session_id
      HAVING COUNT(*) > 1
    `);

    // Get total counts
    const totalNotes = await query(`
      SELECT COUNT(*) as total FROM session_notes
    `);

    const totalSessions = await query(`
      SELECT COUNT(*) as total FROM sessions
    `);

    return NextResponse.json({
      success: true,
      total_notes: (totalNotes as any)[0].total,
      total_sessions: (totalSessions as any)[0].total,
      recent_notes: allNotes,
      duplicate_note_ids: duplicates,
      sessions_with_multiple_notes: sessionDuplicates
    });
  } catch (error: any) {
    console.error("Error fetching session notes debug info:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
