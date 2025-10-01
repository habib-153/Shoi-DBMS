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
    
    // Get all tables in the database
    const [tables] = await connection.execute('SHOW TABLES');
    
    const tableStructures: any = {};
    
    // Get structure for each table
    for (const tableRow of tables as any[]) {
      const tableName = Object.values(tableRow)[0] as string;
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      tableStructures[tableName] = columns;
    }
    
    await connection.end();
    
    return NextResponse.json({
      success: true,
      tables: Object.keys(tableStructures),
      tableStructures: tableStructures
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Database connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}