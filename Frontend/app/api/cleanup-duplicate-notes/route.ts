import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Find sessions with multiple notes
    const sessionsWithDuplicates: any[] = await query(`
      SELECT session_id, COUNT(*) as note_count
      FROM session_notes
      GROUP BY session_id
      HAVING COUNT(*) > 1
    `);

    if (sessionsWithDuplicates.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No duplicate notes found",
        deleted: 0
      });
    }

    let totalDeleted = 0;

    // For each session with duplicates, keep only the latest note
    for (const session of sessionsWithDuplicates) {
      // First, get the latest note_id for this session
      const latestNotes: any[] = await query(`
        SELECT MAX(note_id) as latest_note_id
        FROM session_notes
        WHERE session_id = ?
      `, [session.session_id]);

      const latestNoteId = latestNotes[0].latest_note_id;

      // Delete all notes except the latest one
      const result: any = await query(`
        DELETE FROM session_notes
        WHERE session_id = ? AND note_id < ?
      `, [session.session_id, latestNoteId]);

      const deleted = result.affectedRows || 0;
      totalDeleted += deleted;

      console.log(`Session ${session.session_id}: Deleted ${deleted} old notes, kept note_id ${latestNoteId}`);
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up duplicate notes`,
      sessions_processed: sessionsWithDuplicates.length,
      total_notes_deleted: totalDeleted
    });
  } catch (error: any) {
    console.error("Error cleaning up duplicate notes:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
