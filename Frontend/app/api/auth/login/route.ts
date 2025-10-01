import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function POST(req: Request) {
  console.log('Login attempt initiated...');
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'ইমেইল এবং পাসওয়ার্ড প্রয়োজন' },
        { status: 400 }
      );
    }

    console.log('Attempting database connection...');
    const connection = await pool.getConnection();
    console.log('Database connected successfully');

    try {
      // First check users table
      const [users] = await connection.execute(
        'SELECT *, "user" as role FROM users WHERE email = ?',
        [email]
      ) as [any[], any];

      // If found in users table, verify password
      if (Array.isArray(users) && users.length > 0) {
        const user = users[0];
        // For users, we use base64 encoding (legacy method)
        const password_hash = Buffer.from(password).toString('base64');
        
        if (user.password_hash !== password_hash) {
          return NextResponse.json(
            { error: 'ইমেইল অথবা পাসওয়ার্ড ভুল' },
            { status: 401 }
          );
        }

        // Remove sensitive data before sending
        const { password_hash: _, ...safeUser } = user;
        return NextResponse.json({
          message: 'লগইন সফল হয়েছে',
          user: safeUser,
          role: 'user'
        });
      }

      // If not found in users, check therapists table
      const [therapists] = await connection.execute(
        'SELECT *, "therapist" as role FROM therapists WHERE email = ?',
        [email]
      ) as [any[], any];

      if (!Array.isArray(therapists) || therapists.length === 0) {
        return NextResponse.json(
          { error: 'ইমেইল অথবা পাসওয়ার্ড ভুল' },
          { status: 401 }
        );
      }

      const therapistData = therapists[0];
      // Verify password using bcrypt for therapists
      const isValidPassword = await bcrypt.compare(password, therapistData.password_hash);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'ইমেইল অথবা পাসওয়ার্ড ভুল' },
          { status: 401 }
        );
      }

      // Remove sensitive data before sending
      const { password_hash: _, ...safeTherapist } = therapistData;
      return NextResponse.json({
        message: 'লগইন সফল হয়েছে',
        user: safeTherapist,
        role: 'therapist'
      });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: 'লগইন ব্যর্থ হয়েছে: ' + errorMessage },
      { status: 500 }
    );
  }
}
