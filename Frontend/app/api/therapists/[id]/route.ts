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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT * FROM therapists WHERE therapist_id = ?',
      [id]
    );
    
    await connection.end();
    
    const therapists = rows as any[];
    if (therapists.length === 0) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }
    
    return NextResponse.json(therapists[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
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
      educational_info
    } = body;

    const connection = await mysql.createConnection(dbConfig);
    
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
        educational_info = ?
      WHERE therapist_id = ?`,
      [
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
        id
      ]
    );
    
    await connection.end();
    
    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}