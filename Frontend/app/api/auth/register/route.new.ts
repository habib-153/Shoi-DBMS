import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function POST(req: Request) {
  console.log('Starting registration process...');
  try {
    const data = await req.json();
    console.log('Received registration data:', data);

    const connection = await pool.getConnection();
    console.log('Database connection established');

    try {
      await connection.beginTransaction();

      // Check if user already exists
      const [existingUsers] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [data.email]
      );

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 400 }
        );
      }

      // Basic validation for required fields
      if (!data.name || !data.email ) {
        return NextResponse.json(
          { error: 'Please fill in all required fields' },
          { status: 400 }
        );
      }

      // Hash password (in production, use bcrypt)
      const password_hash = Buffer.from(data.password).toString('base64');

      // Insert into users table first
      const [userResult] = await connection.execute(
        `INSERT INTO users (
          name, 
          email, 
          password_hash, 
          phone, 
          date_of_birth, 
          gender
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.email,
          password_hash,
          data.phone || null,
          data.date_of_birth || null,
          data.gender || null
        ]
      );

      const userId = (userResult as any).insertId;

      if (data.role === 'specialist') {
        // Additional therapist data insertion
        const [therapistResult] = await connection.execute(
          `INSERT INTO therapists (
            user_id,
            name,
            email,
            license_no,
            years_experience,
            gender,
            fees_min,
            fees_max,
            bio,
            languages,
            rating
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            data.name,
            data.email,
            data.type === 'psychiatrist' ? data.license : null,
            0, // Default years_experience
            data.gender || null,
            0, // Default fees_min
            0, // Default fees_max
            data.interested || '', // Using interested fields as initial bio
            'Bengali, English', // Default languages
            0.0 // Default rating
          ]
        );

        const therapistId = (therapistResult as any).insertId;

        // Insert therapist specialty
        const specialtyId = data.type === 'psychiatrist' ? 2 : 1; // 1 for psychologist, 2 for psychiatrist
        await connection.execute(
          'INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (?, ?)',
          [therapistId, specialtyId]
        );

        // Store certificates in a production environment
        // Here we just log the certificate names
        if (data.type === 'psychiatrist' && data.cert) {
          console.log('Psychiatrist certification:', data.cert);
        } else if (data.type === 'psychologist' && data.cert) {
          console.log('Psychologist certification:', data.cert);
        }
      }

      await connection.commit();

      return NextResponse.json(
        { message: `${data.role === 'specialist' ? 'Therapist' : 'User'} registered successfully` },
        { status: 201 }
      );

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Registration failed: ' + errorMessage },
      { status: 500 }
    );
  }
}