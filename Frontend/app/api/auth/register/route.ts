import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Create a connection pool
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
    const { 
      name, 
      email, 
      password, 
      phone, 
      date_of_birth, 
      gender
    } = await req.json();
    
    console.log('Received registration data:', { name, email, phone, date_of_birth, gender });

    // Basic validation
    if (!name || !email || !password || !phone || !date_of_birth || !gender) {
      return NextResponse.json(
        { error: 'সব তথ্য পূরণ করুন' },
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

      // Insert user
      const [userResult] = await connection.execute(
        'INSERT INTO users (name, email, password_hash, phone, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, password_hash, phone, date_of_birth, gender]
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