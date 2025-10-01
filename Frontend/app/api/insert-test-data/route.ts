import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shoi'
};

export async function POST() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check what tables exist first
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = (tables as any[]).map(row => Object.values(row)[0]);
    
    console.log('Available tables:', tableNames);
    
    let results: any = {};
    
    // Insert test user if users table exists
    if (tableNames.includes('users')) {
      try {
        const [userResult] = await connection.execute(
          `INSERT INTO users (name, email, phone, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [
            'John Doe',
            'john.doe@example.com',
            '+1234567890',
            '1990-01-01',
            'Male',
            '123 Main St, City, Country',
            'Jane Doe',
            '+0987654321'
          ]
        );
        results.user = { success: true, insertId: (userResult as any).insertId };
      } catch (userError) {
        results.user = { success: false, error: (userError as Error).message };
      }
    }
    
    // Insert test therapist if therapist table exists
    if (tableNames.includes('therapist')) {
      try {
        const [therapistResult] = await connection.execute(
          `INSERT INTO therapist (name, email, license_no, years_experience, gender, fees_min, fees_max, bio, languages, educational_info) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [
            'Dr. Sarah Smith',
            'dr.sarah@example.com',
            'LIC123456',
            10,
            'Female',
            50,
            100,
            'Experienced therapist specializing in cognitive behavioral therapy.',
            'English, Spanish',
            'PhD in Psychology from University of California'
          ]
        );
        results.therapist = { success: true, insertId: (therapistResult as any).insertId };
      } catch (therapistError) {
        results.therapist = { success: false, error: (therapistError as Error).message };
      }
    }
    
    await connection.end();
    
    return NextResponse.json({
      success: true,
      message: 'Test data insertion attempted',
      availableTables: tableNames,
      results: results
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Database operation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}