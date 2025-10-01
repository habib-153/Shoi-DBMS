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
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        gender ENUM('Male', 'Female', 'Other'),
        address TEXT,
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(20),
        profile_picture VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create therapists table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS therapist (
        therapist_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        license_no VARCHAR(100),
        years_experience INT DEFAULT 0,
        gender ENUM('Male', 'Female', 'Other'),
        fees_min DECIMAL(10,2) DEFAULT 0,
        fees_max DECIMAL(10,2) DEFAULT 0,
        bio TEXT,
        languages VARCHAR(255),
        educational_info TEXT,
        rating DECIMAL(3,2) DEFAULT 0.0,
        profile_picture VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create appointments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        appointment_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        therapist_id INT,
        appointment_date DATETIME NOT NULL,
        duration_minutes INT DEFAULT 60,
        status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
        notes TEXT,
        fee DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (therapist_id) REFERENCES therapist(therapist_id) ON DELETE CASCADE
      )
    `);

    await connection.end();
    
    return NextResponse.json({
      message: 'Database tables created successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Failed to create tables', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}