import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shoi'
};

// GET - Get paid therapists for a user (therapists they can message)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      `SELECT DISTINCT 
        t.therapist_id, 
        t.name as therapist_name,
        t.email as therapist_email,
        t.image,
        COUNT(DISTINCT a.appointment_id) as total_appointments,
        COUNT(DISTINCT p.payment_id) as paid_appointments
      FROM therapists t
      INNER JOIN appointments a ON t.therapist_id = a.therapist_id
      INNER JOIN payments p ON a.appointment_id = p.appointment_id
      WHERE a.user_id = ? 
        AND (p.status = 'completed' OR p.status = 'paid')
      GROUP BY t.therapist_id, t.name, t.email, t.image
      ORDER BY MAX(p.paid_at) DESC`,
      [id]
    );
    
    await connection.end();
    
    return NextResponse.json({ 
      success: true,
      therapists: rows 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
