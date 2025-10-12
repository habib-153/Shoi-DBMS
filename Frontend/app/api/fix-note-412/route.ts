import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Update note 412 to point to session 403 (jeba + rishi)
    // instead of session 1 (Nabila + Fayaz)
    await query(`
      UPDATE session_notes 
      SET session_id = 403
      WHERE note_id = 412
    `);

    // Verify the update
    const updatedNote = await query(`
      SELECT 
        sn.note_id,
        sn.session_id,
        sn.summary,
        s.appointment_id,
        a.user_id,
        a.therapist_id,
        u.name as user_name,
        t.name as therapist_name
      FROM session_notes sn
      JOIN sessions s ON sn.session_id = s.session_id
      JOIN appointments a ON s.appointment_id = a.appointment_id
      JOIN users u ON a.user_id = u.user_id
      JOIN therapists t ON a.therapist_id = t.therapist_id
      WHERE sn.note_id = 412
    `);

    return NextResponse.json({
      success: true,
      message: "Note 412 has been reassigned to the correct session (jeba + rishi)",
      updated_note: updatedNote[0]
    });
  } catch (error: any) {
    console.error("Error fixing note 412:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
