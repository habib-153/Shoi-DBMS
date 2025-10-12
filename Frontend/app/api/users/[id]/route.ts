import { NextRequest, NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shoi'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API: Fetching user profile for ID:', id);

    if (!id || id === 'undefined' || id === 'null') {
      console.error('API: Invalid user ID provided:', id);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Try to find user in users table first
    const userQuery = 'SELECT * FROM users WHERE user_id = ?';
    const [userResults] = await connection.execute(userQuery, [id]) as [RowDataPacket[], any];

    if (userResults.length > 0) {
      const user = userResults[0];
      await connection.end();
      
      return NextResponse.json({
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        Hobby: user.Hobby,
        profession: user.profession,
        free_text: user.free_text,
        role: 'user',
        user_type: 'user'
      });
    }

    // If not found in users, try therapists table
    const therapistQuery = 'SELECT * FROM therapists WHERE therapist_id = ?';
    const [therapistResults] = await connection.execute(therapistQuery, [id]) as [RowDataPacket[], any];

    if (therapistResults.length > 0) {
      const therapist = therapistResults[0];
      await connection.end();
      
      return NextResponse.json({
        therapist_id: therapist.therapist_id,
        name: therapist.name,
        email: therapist.email,
        phone: therapist.phone,
        license_no: therapist.license_no,
        years_experience: therapist.years_experience,
        fees_min: therapist.fees_min,
        fees_max: therapist.fees_max,
        bio: therapist.bio,
        languages: therapist.languages,
        educational_info: therapist.educational_info,
        Interested_field: therapist.Interested_field,
        rating: therapist.rating,
        image: therapist.image,
        role: 'therapist',
        user_type: 'therapist'
      });
    }

    await connection.end();
    return NextResponse.json({ error: 'User not found' }, { status: 404 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
