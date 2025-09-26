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
      // Hash password the same way we did in registration
      const password_hash = Buffer.from(password).toString('base64');

      const [users] = await connection.execute(
        'SELECT * FROM users WHERE email = ? AND password_hash = ?',
        [email, password_hash]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json(
          { error: 'ইমেইল অথবা পাসওয়ার্ড ভুল' },
          { status: 401 }
        );
      }

      const user = users[0];
      
      // Remove sensitive data before sending
      const { password_hash: _, ...safeUser } = user;

      return NextResponse.json({
        message: 'লগইন সফল হয়েছে',
        user: safeUser
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