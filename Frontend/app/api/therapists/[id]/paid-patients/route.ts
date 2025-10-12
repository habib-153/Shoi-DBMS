import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shoi'
};

// GET - Get paid patients for a therapist (patients who can message them)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      `SELECT DISTINCT 
        u.user_id, 
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        COUNT(DISTINCT a.appointment_id) as total_appointments,
        COUNT(DISTINCT p.payment_id) as paid_appointments,
        MAX(p.paid_at) as last_payment_date
      FROM users u
      INNER JOIN appointments a ON u.user_id = a.user_id
      INNER JOIN payments p ON a.appointment_id = p.appointment_id
      WHERE a.therapist_id = ? 
        AND (p.status = 'completed' OR p.status = 'paid')
      GROUP BY u.user_id, u.name, u.email, u.phone
      ORDER BY last_payment_date DESC`,
      [id]
    );
    
    await connection.end();
    
    return NextResponse.json({ 
      success: true,
      patients: rows 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}