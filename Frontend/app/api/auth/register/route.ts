import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Create a connection pool
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shoi',
};

const pool = mysql.createPool(dbConfig);

export async function POST(req: Request) {
  console.log('Starting registration process...');
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      date_of_birth, 
      gender,
      hobby,
      profession,
      free_text
    } = await req.json();
    
    console.log('Received registration data:', { 
      name, 
      email, 
      phone, 
      date_of_birth, 
      gender,
      hobby,
      profession,
      free_text
    });

    // Basic validation for required fields
    if (!email || !password || !date_of_birth) {
      return NextResponse.json(
        { error: 'Email, password and date of birth are required' },
        { status: 400 }
      );
    }

    // Name is required (will be "Anonymous" if user chose anonymous option)
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to connect to database...');
    // Get a connection from the pool
    const connection = await pool.getConnection();
    console.log('Database connection established');

    try {
      // Check if user already exists
      const [existingUsers] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }

      // Hash password using a simple method (in production, use bcrypt or better)
      const password_hash = Buffer.from(password).toString('base64');

      // Insert user with optional fields
      const [userResult] = await connection.execute(
        `INSERT INTO \`shoi\`.\`users\` (
          name, 
          email, 
          password_hash, 
          phone, 
          date_of_birth, 
          gender,
          hobby,
          profession,
          free_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          email,
          password_hash,
          phone || null,
          date_of_birth,
          gender || null,
          hobby || null,
          profession || null,
          free_text || null
        ]
      );

      return NextResponse.json(
        { message: 'User registered successfully' },
        { status: 201 }
      );
    } finally {
      connection.release(); // Always release the connection
    }
  } catch (error) {
    console.error('Registration error:', error);
    // More detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: 'Registration failed: ' + errorMessage },
      { status: 500 }
    );
  }
}