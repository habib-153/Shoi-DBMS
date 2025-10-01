import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'shoi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// GET all therapists
export async function GET(request: Request) {
  console.log('API: Fetching therapists...');

  try {
    const { searchParams } = new URL(request.url);
    const specialty_id = searchParams.get('specialty_id');
    console.log('Specialty ID:', specialty_id);
    
    const connection = await pool.getConnection();
    
    try {
      // First, let's check if the specialties table has data
      const [specialties] = await connection.execute('SELECT * FROM specialties');
      console.log('Specialties in database:', specialties);

      // Then check therapists table
      const [therapists] = await connection.execute('SELECT * FROM therapists');
      console.log('Therapists in database:', therapists);

      // Check therapist_specialties table
      const [specialtyMappings] = await connection.execute('SELECT * FROM therapist_specialties');
      console.log('Specialty mappings in database:', specialtyMappings);

      // Now do our main query with a simpler structure first
      const query = `
        SELECT 
          t.*, 
          ts.specialty_id
        FROM therapists t
        LEFT JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
      `;
      
      console.log('Executing query:', query);
      const [rows] = await connection.execute(query);
      console.log('Query results:', rows);
      console.log('API: Query executed, rows:', rows);
      return NextResponse.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch therapists', therapists: [] },
      { status: 500 }
    );
  }
}

// POST new therapist
export async function POST(req: Request) {
  console.log('Starting therapist registration process...');
  
  try {
    const { 
      name, 
      email, 
      password,
      university,
      certificate,
      interested,
      license_no
    } = await req.json();

    console.log('Received data:', { name, email, university, certificate: 'LINK' });

    // Validate required fields
    if (!name || !email || !password || !university || !certificate) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    console.log('Attempting to connect to database...');
    const connection = await pool.getConnection();
    console.log('Database connection established');
    
    try {
      await connection.beginTransaction();
      console.log('Transaction started');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('Password hashed');

      const query = `INSERT INTO \`shoi\`.\`therapists\` (
        name, 
        email, 
        password_hash,
        educational_info,
        interested_field,
        image,
        license_no,
        years_experience,
        gender,
        fees_min,
        fees_max,
        bio,
        languages,
        rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        name, 
        email, 
        hashedPassword,
        university,
        interested || null,
        certificate,
        license_no || null,
        0,
        null,
        0,
        0,
        null,
        null,
        0.00
      ];

      console.log('Executing query...');
      const [result] = await connection.execute(query, values);
      console.log('Query executed successfully');
      
      const therapistId = (result as any).insertId;
      
      await connection.commit();
      console.log('Transaction committed');
      
      return NextResponse.json({ 
        id: therapistId, 
        message: 'Therapist added successfully' 
      });
    } catch (error) {
      console.error('Error in database operation:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      { error: 'Failed to add therapist: ' + (error as Error).message },
      { status: 500 }
    );
  }
}