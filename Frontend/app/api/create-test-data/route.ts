import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shoi'
});

export async function POST() {
  try {
    await connection;
    
    console.log('Creating test data for actual database schema...');
    
    // Insert test user data
    const userInsertQuery = `
      INSERT INTO users (name, email, phone, date_of_birth, gender, Hobby, profession, free_text) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const userValues = [
      'John Doe',
      'john.doe@example.com',
      '+880-123-456789',
      '1990-05-15',
      'Male',
      'Reading, Swimming, Gaming',
      'Software Engineer',
      'I am passionate about technology and mental health. Looking for therapy to manage work stress.'
    ];
    
    const userResult = await (await connection).execute(userInsertQuery, userValues);
    console.log('User inserted with ID:', userResult);
    
    // Insert test therapist data
    const therapistInsertQuery = `
      INSERT INTO therapists (name, email, license_no, years_experience, gender, fees_min, fees_max, bio, languages, educational_info, Interested_field, rating, image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const therapistValues = [
      'Dr. Sarah Ahmed',
      'dr.sarah@therapy.com',
      'LIC-PSY-2020-001',
      8,
      'Female',
      2000,
      5000,
      'Experienced clinical psychologist specializing in cognitive behavioral therapy, anxiety, and depression. I believe in creating a safe, non-judgmental space for healing.',
      'English, Bengali, Hindi',
      'PhD in Clinical Psychology from Dhaka University, Masters in Counseling Psychology, CBT Certification',
      'Cognitive Behavioral Therapy, Anxiety Disorders, Depression',
      4.8,
      null
    ];
    
    const therapistResult = await (await connection).execute(therapistInsertQuery, therapistValues);
    console.log('Therapist inserted with ID:', therapistResult);
    
    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      userResult,
      therapistResult
    });
    
  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json({
      error: 'Failed to create test data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}