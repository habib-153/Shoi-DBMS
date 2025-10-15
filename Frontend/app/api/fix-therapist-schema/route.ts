import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

// GET - Check and add specialization column if needed
export async function GET() {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Check if specialization column exists
      const [columns] = await connection.execute(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? 
         AND TABLE_NAME = 'therapists' 
         AND COLUMN_NAME = 'specialization'`,
        [process.env.MYSQL_DATABASE || 'shoi']
      );

      const specializationExists = (columns as any[]).length > 0;

      if (!specializationExists) {
        console.log('Adding specialization column to therapists table...');
        
        // Add the specialization column
        await connection.execute(
          `ALTER TABLE therapists 
           ADD COLUMN specialization ENUM('psychologist', 'psychiatrist', 'counselor', 'therapist') 
           DEFAULT 'therapist' 
           AFTER phone`
        );

        // Update existing therapists
        await connection.execute(
          `UPDATE therapists 
           SET specialization = 'therapist' 
           WHERE specialization IS NULL`
        );

        return NextResponse.json({
          success: true,
          message: 'Specialization column added successfully',
          action: 'added'
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'Specialization column already exists',
          action: 'none'
        });
      }
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error checking/adding specialization column:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check/add specialization column',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
