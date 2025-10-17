import { NextRequest, NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shoi'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API: Fetching appointments for user ID:', id);
    
    const connection = await mysql.createConnection(dbConfig);
    
    const query = `
      SELECT 
        a.*,
        t.name as therapist_name,
        t.email as therapist_email,
        p.payment_id,
        p.status as payment_status,
        p.amount as payment_amount,
        s.session_id,
        CASE 
          WHEN sn.note_id IS NOT NULL THEN 1
          ELSE 0
        END as has_session_notes,
        CASE
          WHEN sn.note_id IS NOT NULL THEN 'completed'
          ELSE 'upcoming'
        END as computed_status
      FROM appointments a
      JOIN therapists t ON a.therapist_id = t.therapist_id
      LEFT JOIN payments p ON a.appointment_id = p.appointment_id
      LEFT JOIN sessions s ON a.appointment_id = s.appointment_id
      LEFT JOIN session_notes sn ON s.session_id = sn.session_id
      WHERE a.user_id = ?
      ORDER BY a.start_time DESC
    `;
    
    const [appointments] = await connection.execute(query, [id]) as [RowDataPacket[], any];
    
    await connection.end();
    
    return NextResponse.json({
      appointments: appointments || []
    });
    
  } catch (error) {
    console.error('API: Error fetching user appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}