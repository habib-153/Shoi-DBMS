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
    const data = await req.json();
    console.log('Received registration data:', data);

    // Basic validation
    // if (!data.name || !data.email ) {
    //   return NextResponse.json(
    //     { error: 'Please provide name, email and password' },
    //     { status: 400 }
    //   );
    // }

    console.log('Attempting to connect to database...');
    // Get a connection from the pool
    const connection = await pool.getConnection();
    console.log('Database connection established');

    try {
      // Check if user already exists
      const [existingUsers] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [data.email]
      );

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }

      // Hash password using a simple method (in production, use bcrypt or better)
      const password_hash = Buffer.from(data.password).toString('base64');

      // Insert user
      const [userResult] = await connection.execute(
        'INSERT INTO users (name, email, password_hash, phone, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?)',
        [data.name, data.email, password_hash, data.phone || null, data.date_of_birth || null, data.gender || null]
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