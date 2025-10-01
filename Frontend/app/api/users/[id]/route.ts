import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shoi'
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('API: Fetching user profile for ID:', params.id);
    
    if (!params.id || params.id === 'undefined' || params.id === 'null') {
      console.error('API: Invalid user ID provided:', params.id);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);
    console.log('API: Database connection established');
    
    // First check if it's a user
    const [userRows] = await connection.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [params.id]
    );
    
    const users = userRows as any[];
    console.log('API: User query result:', users.length > 0 ? 'Found user' : 'No user found');
    
    if (users.length > 0) {
      await connection.end();
      console.log('API: Returning user data');
      return NextResponse.json({ ...users[0], user_type: 'user' });
    }

    // If not found in users, check therapists table
    const [therapistRows] = await connection.execute(
      'SELECT * FROM therapists WHERE therapist_id = ?',
      [params.id]
    );
    
    await connection.end();
    
    const therapists = therapistRows as any[];
    console.log('API: Therapist query result:', therapists.length > 0 ? 'Found therapist' : 'No therapist found');
    
    if (therapists.length === 0) {
      console.error('API: User not found in either table for ID:', params.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('API: Returning therapist data');
    return NextResponse.json({ ...therapists[0], user_type: 'therapist' });
  } catch (error) {
    console.error('API: Database error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('API: Updating profile for ID:', params.id, 'with data:', body);
    
    // Determine if it's a user or therapist based on the data structure
    const isTherapist = body.license_no !== undefined || body.years_experience !== undefined || body.user_type === 'therapist';
    
    if (isTherapist) {
      // Update therapist profile
      const {
        name,
        email,
        license_no,
        years_experience,
        gender,
        fees_min,
        fees_max,
        bio,
        languages,
        educational_info,
        Interested_field,
        image
      } = body;

      const [result] = await connection.execute(
        `UPDATE therapists SET 
          name = ?, 
          email = ?, 
          license_no = ?, 
          years_experience = ?, 
          gender = ?, 
          fees_min = ?, 
          fees_max = ?, 
          bio = ?, 
          languages = ?, 
          educational_info = ?,
          Interested_field = ?,
          image = ?
        WHERE therapist_id = ?`,
        [
          name,
          email,
          license_no,
          years_experience,
          gender,
          fees_min || 0,
          fees_max || 0,
          bio,
          languages,
          educational_info,
          Interested_field,
          image,
          params.id
        ]
      );
      console.log('API: Therapist update result:', result);
    } else {
      // Update user profile
      const {
        name,
        email,
        phone,
        date_of_birth,
        gender,
        Hobby,
        profession,
        free_text
      } = body;

      const [result] = await connection.execute(
        `UPDATE users SET 
          name = ?, 
          email = ?, 
          phone = ?, 
          date_of_birth = ?, 
          gender = ?, 
          Hobby = ?, 
          profession = ?, 
          free_text = ?
        WHERE user_id = ?`,
        [
          name,
          email,
          phone,
          date_of_birth,
          gender,
          Hobby,
          profession,
          free_text,
          params.id
        ]
      );
      console.log('API: User update result:', result);
    }
    
    await connection.end();
    
    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('API: Database error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}