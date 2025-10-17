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
      
      // Check privacy settings - if profile is private and viewer is not the owner
      const { searchParams } = new URL(request.url);
      const viewerId = searchParams.get('viewer_id');
      
      if (viewerId !== id) {
        const [privacyResults] = await connection.execute(
          'SELECT profile_visibility FROM privacy_settings WHERE user_id = ?',
          [id]
        ) as [RowDataPacket[], any];
        
        if (privacyResults.length > 0 && privacyResults[0].profile_visibility === 'private') {
          await connection.end();
          return NextResponse.json({ error: 'This profile is private' }, { status: 403 });
        }
      }
      
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

// PUT - Update user/therapist profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API: Updating profile for ID:', id);

    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Update data:', body);

    const connection = await mysql.createConnection(dbConfig);

    // Determine if this is a user or therapist based on the data
    const isTherapist = body.therapist_id || body.user_type === 'therapist' || body.license_no;

    if (isTherapist) {
      // Update therapist profile
      const updateFields: string[] = [];
      const values: any[] = [];

      // Only update provided fields
      if (body.name !== undefined) { updateFields.push('name = ?'); values.push(body.name); }
      if (body.email !== undefined) { updateFields.push('email = ?'); values.push(body.email); }
      if (body.phone !== undefined) { updateFields.push('phone = ?'); values.push(body.phone); }
      if (body.date_of_birth !== undefined) { 
        // Convert ISO date string to MySQL date format (YYYY-MM-DD)
        const dateOnly = body.date_of_birth.split('T')[0];
        updateFields.push('date_of_birth = ?'); 
        values.push(dateOnly); 
      }
      if (body.gender !== undefined) { updateFields.push('gender = ?'); values.push(body.gender); }
      if (body.license_no !== undefined) { updateFields.push('license_no = ?'); values.push(body.license_no); }
      if (body.years_experience !== undefined) { updateFields.push('years_experience = ?'); values.push(body.years_experience); }
      if (body.fees_min !== undefined) { updateFields.push('fees_min = ?'); values.push(body.fees_min); }
      if (body.fees_max !== undefined) { updateFields.push('fees_max = ?'); values.push(body.fees_max); }
      if (body.bio !== undefined) { updateFields.push('bio = ?'); values.push(body.bio); }
      if (body.languages !== undefined) { updateFields.push('languages = ?'); values.push(body.languages); }
      if (body.educational_info !== undefined) { updateFields.push('educational_info = ?'); values.push(body.educational_info); }
      if (body.Interested_field !== undefined) { updateFields.push('Interested_field = ?'); values.push(body.Interested_field); }
      if (body.image !== undefined) { updateFields.push('image = ?'); values.push(body.image); }

      if (updateFields.length === 0) {
        await connection.end();
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
      }

      values.push(id);
      const query = `UPDATE therapists SET ${updateFields.join(', ')} WHERE therapist_id = ?`;
      
      console.log('Executing therapist update:', query, values);
      await connection.execute(query, values);

      // Fetch updated profile
      const [updated] = await connection.execute(
        'SELECT * FROM therapists WHERE therapist_id = ?',
        [id]
      ) as [RowDataPacket[], any];

      await connection.end();

      if (updated.length > 0) {
        return NextResponse.json({
          success: true,
          message: 'Profile updated successfully',
          profile: {
            ...updated[0],
            user_type: 'therapist',
            role: 'therapist'
          }
        });
      }

    } else {
      // Update regular user profile
      const updateFields: string[] = [];
      const values: any[] = [];

      // Only update provided fields
      if (body.name !== undefined) { updateFields.push('name = ?'); values.push(body.name); }
      if (body.email !== undefined) { updateFields.push('email = ?'); values.push(body.email); }
      if (body.phone !== undefined) { updateFields.push('phone = ?'); values.push(body.phone); }
      if (body.date_of_birth !== undefined) { 
        // Convert ISO date string to MySQL date format (YYYY-MM-DD)
        const dateOnly = body.date_of_birth.split('T')[0];
        updateFields.push('date_of_birth = ?'); 
        values.push(dateOnly); 
      }
      if (body.gender !== undefined) { updateFields.push('gender = ?'); values.push(body.gender); }
      if (body.Hobby !== undefined) { updateFields.push('Hobby = ?'); values.push(body.Hobby); }
      if (body.profession !== undefined) { updateFields.push('profession = ?'); values.push(body.profession); }
      if (body.free_text !== undefined) { updateFields.push('free_text = ?'); values.push(body.free_text); }

      if (updateFields.length === 0) {
        await connection.end();
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
      }

      values.push(id);
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;
      
      console.log('Executing user update:', query, values);
      await connection.execute(query, values);

      // Fetch updated profile
      const [updated] = await connection.execute(
        'SELECT * FROM users WHERE user_id = ?',
        [id]
      ) as [RowDataPacket[], any];

      await connection.end();

      if (updated.length > 0) {
        return NextResponse.json({
          success: true,
          message: 'Profile updated successfully',
          profile: {
            ...updated[0],
            user_type: 'user',
            role: 'user'
          }
        });
      }
    }

    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });

  } catch (error: any) {
    console.error('API Error updating profile:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
