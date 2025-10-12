import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    
    let sql = `
      SELECT 
        s.session_id,
        s.appointment_id,
        s.session_date,
        s.duration_min,
        a.user_id,
        a.therapist_id,
        a.status,
        u.name as user_name,
        u.email as user_email,
        t.name as therapist_name,
        t.email as therapist_email,
        COUNT(sn.note_id) as note_count,
        MAX(sn.note_id) as latest_note_id
      FROM sessions s
      JOIN appointments a ON s.appointment_id = a.appointment_id
      JOIN users u ON a.user_id = u.user_id
      JOIN therapists t ON a.therapist_id = t.therapist_id
      LEFT JOIN session_notes sn ON s.session_id = sn.session_id
    `;

    const params: any[] = [];
    if (userId) {
      sql += ' WHERE a.user_id = ?';
      params.push(userId);
    }

    sql += ' GROUP BY s.session_id ORDER BY s.session_date DESC LIMIT 20';

    const sessions = await query(sql, params);

    return NextResponse.json({
      success: true,
      count: sessions.length,
      sessions: sessions
    });
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
