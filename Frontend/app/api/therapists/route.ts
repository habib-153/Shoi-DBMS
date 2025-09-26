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

// GET all therapists
export async function GET() {
  console.log('API: Fetching therapists...');
  try {
    const connection = await pool.getConnection();
    console.log('API: Database connection established');
    try {
      const [rows] = await connection.execute('SELECT * FROM therapists');
      console.log('API: Query executed, rows:', rows);
      return NextResponse.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch therapists' },
      { status: 500 }
    );
  }
}

// POST new therapist
export async function POST(req: Request) {
  try {
    const { name, email, specialties, phone, qualifications } = await req.json();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insert therapist
      const [result] = await connection.execute(
        'INSERT INTO therapists (name, email, phone, qualifications) VALUES (?, ?, ?, ?)',
        [name, email, phone, qualifications]
      );
      
      const therapistId = (result as any).insertId;
      
      // Insert specialties
      if (specialties && specialties.length > 0) {
        for (const specialtyId of specialties) {
          await connection.execute(
            'INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (?, ?)',
            [therapistId, specialtyId]
          );
        }
      }
      
      await connection.commit();
      return NextResponse.json({ id: therapistId, message: 'Therapist added successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error adding therapist:', error);
    return NextResponse.json(
      { error: 'Failed to add therapist' },
      { status: 500 }
    );
  }
}