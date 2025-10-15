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

// GET all therapists
export async function GET(request: Request) {
  console.log('API: Fetching therapists...');
  
  // Check if environment variables are set
  if (!process.env.MYSQL_HOST || !process.env.MYSQL_DATABASE) {
    console.error('Database environment variables are not set');
    return NextResponse.json(
      { 
        error: 'Database configuration missing',
        details: 'Please set up your .env.local file with database credentials'
      },
      { status: 500 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const specialty_id = searchParams.get('specialty_id');
    console.log('Specialty ID:', specialty_id);
    
    let connection;
    try {
      connection = await pool.getConnection();
      console.log('API: Database connection established');
    } catch (connError) {
      console.error('Database connection error:', connError);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: 'Could not connect to MySQL database. Please ensure MySQL is running.'
        },
        { status: 500 }
      );
    }
    
    try {
      // First, let's check if the specialties table has data
      const [specialties] = await connection.execute('SELECT * FROM specialties');
      console.log('Specialties in database:', specialties);

      // Then check therapists table
      const [therapists] = await connection.execute('SELECT * FROM therapists');
      console.log('Therapists in database:', therapists);

      // Check therapist_specialties table
      const [specialtyMappings] = await connection.execute('SELECT * FROM therapist_specialties');
      console.log('Specialty mappings in database:', specialtyMappings);

      // Now do our main query with a simpler structure first
      const query = `
        SELECT 
          t.*, 
          ts.specialty_id
        FROM therapists t
        LEFT JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
      `;
      
      console.log('Executing query:', query);
      const [rows] = await connection.execute(query);
      console.log('Query results:', rows);
      console.log('API: Query executed, rows:', rows);
      return NextResponse.json(rows);
    } catch (queryError: any) {
      console.error('Database query error:', queryError);
      return NextResponse.json(
        { 
          error: 'Database query failed',
          details: queryError.message || 'Error executing database query'
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch therapists',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// POST new therapist
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log('Registration request body:', body);
    
    // Handle both old registration format and new direct format
    const {
      // Registration format fields
      name,
      email,
      password,
      university,
      certificate,
      interested,
      license_no,
      // Direct API format fields
      phone,
      qualifications,
      specialization,
      experience_years,
      bio,
      location,
      consultation_fee,
      languages
    } = body;
    
    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Determine specialization from registration or use provided value
    let therapistSpecialization = specialization || 'therapist';
    
    // If coming from registration, determine specialization
    if (license_no && !specialization) {
      // Has license_no = psychiatrist
      therapistSpecialization = 'psychiatrist';
    } else if (university && !license_no && !specialization) {
      // Has university but no license = psychologist
      therapistSpecialization = 'psychologist';
    }

    console.log('Determined specialization:', therapistSpecialization);

    // Validate specialization
    const validSpecializations = ['psychologist', 'psychiatrist', 'counselor', 'therapist'];
    if (!validSpecializations.includes(therapistSpecialization)) {
      return NextResponse.json(
        { 
          error: 'Invalid specialization', 
          details: `Specialization must be one of: ${validSpecializations.join(', ')}` 
        },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Hash password if provided
      let hashedPassword: string | null = null;
      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Password hashed successfully');
      }
      
      // Prepare bio with registration details
      let therapistBio = bio || '';
      if (university) {
        therapistBio = `Education: ${university}`;
        if (interested) {
          therapistBio += `\nInterested in: ${interested}`;
        }
        if (license_no) {
          therapistBio += `\nLicense: ${license_no}`;
        }
      }
      
      // Insert therapist - Using ACTUAL columns from your database
      // Your table has: license_no, years_experience, gender, fees_min, fees_max, 
      // bio, languages, rating, password_hash, Interested_field, educational_info, image
      const [result] = await connection.execute(
        `INSERT INTO therapists (
          name, 
          email,
          password_hash,
          license_no,
          years_experience,
          bio,
          languages,
          rating,
          educational_info,
          image,
          Interested_field,
          fees_min,
          fees_max
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, 
          email,
          hashedPassword, // Use hashed password
          license_no || null,
          experience_years || 0,
          therapistBio || null,
          languages || 'English, Bengali',
          4.5, // default rating
          university || null, // educational_info
          certificate || null, // image (Google Drive link)
          interested || null, // Interested_field
          consultation_fee || 2000, // fees_min
          consultation_fee || 3000 // fees_max
        ]
      );
      
      const therapistId = (result as any).insertId;
      console.log('Therapist created successfully:', therapistId);
      
      // Try to update specialization if column exists
      try {
        await connection.execute(
          `UPDATE therapists SET specialization = ? WHERE therapist_id = ?`,
          [therapistSpecialization, therapistId]
        );
        console.log('Specialization updated:', therapistSpecialization);
      } catch (updateError: any) {
        console.log('Specialization column does not exist - skipping update');
      }
      
      await connection.commit();
      return NextResponse.json({ 
        id: therapistId, 
        message: 'Therapist added successfully',
        therapist_id: therapistId,
        specialization: therapistSpecialization
      }, { status: 201 });
    } catch (error: any) {
      await connection.rollback();
      console.error('Database error adding therapist:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Check for duplicate email error
      if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
          { error: 'Email already exists', details: 'A therapist with this email already exists in the system' },
          { status: 409 }
        );
      }
      
      // Check for unknown column error
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        return NextResponse.json(
          { 
            error: 'Database schema mismatch', 
            details: `Column does not exist: ${error.message}. Please run database migrations.` 
          },
          { status: 500 }
        );
      }
      
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error adding therapist:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add therapist',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}