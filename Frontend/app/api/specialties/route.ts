import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'shoi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// GET - Fetch all specialties following your schema
export async function GET() {
  try {
    const connection = await pool.getConnection();
    
    try {
      const [specialties] = await connection.execute(`
        SELECT 
          specialty_id,
          name,
          description
        FROM specialties
        ORDER BY name ASC
      `);

      return NextResponse.json({
        specialties: specialties || []
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching specialties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialties', specialties: [] },
      { status: 500 }
    );
  }
}

// POST - Create new specialty
export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Specialty name is required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      // Check if specialty already exists
      const [existing] = await connection.execute(
        'SELECT specialty_id FROM specialties WHERE name = ?',
        [name]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { error: 'Specialty with this name already exists' },
          { status: 409 }
        );
      }

      const [result] = await connection.execute(
        'INSERT INTO specialties (name, description) VALUES (?, ?)',
        [name, description || null]
      );

      const specialtyId = (result as any).insertId;

      return NextResponse.json({
        message: 'Specialty created successfully',
        specialty_id: specialtyId
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creating specialty:', error);
    return NextResponse.json(
      { error: 'Failed to create specialty' },
      { status: 500 }
    );
  }
}