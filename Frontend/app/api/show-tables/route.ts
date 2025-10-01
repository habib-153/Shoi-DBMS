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
    
    // Show all tables
    const [tables] = await connection.execute('SHOW TABLES');
    
    await connection.end();
    
    return NextResponse.json({
      tables: tables,
      message: 'Database tables listed successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Database query failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}