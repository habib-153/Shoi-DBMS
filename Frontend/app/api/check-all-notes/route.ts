import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    
    let sql = `
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
        a.user_id,
        a.therapist_id,
        u.name as user_name,
        u.email as user_email,
        t.name as therapist_name,
        t.email as therapist_email
      FROM session_notes sn
      JOIN sessions s ON sn.session_id = s.session_id
      JOIN appointments a ON s.appointment_id = a.appointment_id
      JOIN users u ON a.user_id = u.user_id
      JOIN therapists t ON a.therapist_id = t.therapist_id
    `;

    const params: any[] = [];
    if (userId) {
      sql += ' WHERE a.user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY sn.created_at DESC LIMIT 50';

    const notes = await query(sql, params);

    return NextResponse.json({
      success: true,
      count: notes.length,
      notes: notes
    });
  } catch (error: any) {
    console.error("Error fetching all notes:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
