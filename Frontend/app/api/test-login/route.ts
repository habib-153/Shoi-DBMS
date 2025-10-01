import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Simulate logging in with test user data based on your actual database
    const testUserData = {
      user_id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    };

    return NextResponse.json({
      message: 'Test login successful',
      user: testUserData
    });
  } catch (error) {
    console.error('Test login error:', error);
    return NextResponse.json({ 
      error: 'Test login failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}