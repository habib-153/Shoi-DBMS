import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

// GET - Check therapists table structure
export async function GET() {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Get table structure
      const [columns] = await connection.execute('DESCRIBE therapists');
      
      return NextResponse.json({
        success: true,
        columns: columns,
        message: 'Therapists table structure retrieved successfully'
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error checking therapists table:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check therapists table',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
