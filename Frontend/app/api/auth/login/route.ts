import { NextResponse } from 'next/server';
import { query } from "@/lib/db";
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  console.log('Login attempt initiated...');
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'ইমেইল এবং পাসওয়ার্ড প্রয়োজন' },
        { status: 400 }
      );
    }

    console.log('Attempting database query for role:', role);

    // Check the preferred table first based on role
    if (role === 'therapist') {
      // Check therapists table first when role is therapist
      const therapists = await query(
        'SELECT *, "therapist" as role FROM therapists WHERE email = ?',
        [email]
      );

      if (Array.isArray(therapists) && therapists.length > 0) {
        const therapistData = therapists[0];
        // Verify password using bcrypt for therapists
        const isValidPassword = await bcrypt.compare(password, therapistData.password_hash);
        
        if (isValidPassword) {
          // Remove sensitive data before sending
          const { password_hash: _p, ...safeTherapist } = therapistData;
          return NextResponse.json({
            message: 'লগইন সফল হয়েছে',
            user: safeTherapist,
            role: 'therapist'
          });
        }
      }
    } else {
      // Check users table first when role is user (or default)
      const users = await query(
        'SELECT *, "user" as role FROM users WHERE email = ?',
        [email]
      );

      if (Array.isArray(users) && users.length > 0) {
        const user = users[0];
        // For users, we use base64 encoding (legacy method)
        const password_hash = Buffer.from(password).toString('base64');
        
        if (user.password_hash === password_hash) {
          // Remove sensitive data before sending
          const { password_hash: _, ...safeUser } = user;
          return NextResponse.json({
            message: 'লগইন সফল হয়েছে',
            user: safeUser,
            role: 'user'
          });
        }
      }
    }

    // If primary check fails, return error (don't check other table to avoid confusion)
    return NextResponse.json(
      { error: 'ইমেইল অথবা পাসওয়ার্ড ভুল' },
      { status: 401 }
    );

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
