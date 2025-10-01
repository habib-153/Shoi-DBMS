import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shoi'
};

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check users table
    const [userRows] = await connection.execute('SELECT user_id, name, email FROM users LIMIT 5');
    
    // Check therapists table
    const [therapistRows] = await connection.execute('SELECT therapist_id, name, email FROM therapist LIMIT 5');
    
    await connection.end();
    
    return NextResponse.json({
      users: userRows,
      therapists: therapistRows,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}