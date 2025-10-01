import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'shoi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// GET - Fetch all therapists with their specialties following your schema
export async function GET() {
  try {
    const connection = await pool.getConnection();
    
    try {
      // First get all therapists using your exact schema field names
      const [therapists] = await connection.execute(`
        SELECT 
          therapist_id,
          name,
          email,
          license_no,
          years_experience,
          gender,
          fees_min,
          fees_max,
          bio,
          languages,
          rating,
          interesterd_field,
          educational_info,
          image
        FROM therapists
        ORDER BY rating DESC, years_experience DESC
      `);

      // Then get specialties for each therapist using your junction table
      const therapistsWithSpecialties: any[] = [];
      
      for (const therapist of (therapists as any[])) {
        try {
          const [specialties] = await connection.execute(`
            SELECT 
              s.specialty_id,
              s.name,
              s.description
            FROM specialties s
            INNER JOIN therapist_specialties ts ON s.specialty_id = ts.specialty_id
            WHERE ts.therapist_id = ?
          `, [therapist.therapist_id]);

          therapistsWithSpecialties.push({
            ...therapist,
            specialties: specialties || []
          });
        } catch (specialtyError) {
          // If there's an error fetching specialties for this therapist, 
          // still include the therapist without specialties
          console.warn(`Error fetching specialties for therapist ${therapist.therapist_id}:`, specialtyError);
          therapistsWithSpecialties.push({
            ...therapist,
            specialties: []
          });
        }
      }

      return NextResponse.json({
        therapists: therapistsWithSpecialties
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching therapists with specialties:', error);
    
    // Fallback: try to get therapists without specialties
    try {
      const connection = await pool.getConnection();
      const [therapists] = await connection.execute(`
        SELECT 
          therapist_id,
          name,
          email,
          license_no,
          years_experience,
          gender,
          fees_min,
          fees_max,
          bio,
          languages,
          rating,
          interesterd_field,
          educational_info,
          image
        FROM therapists
        ORDER BY rating DESC, years_experience DESC
      `);
      connection.release();

      // Return therapists without specialties as fallback
      const therapistsWithoutSpecialties = (therapists as any[]).map(therapist => ({
        ...therapist,
        specialties: []
      }));

      return NextResponse.json({
        therapists: therapistsWithoutSpecialties
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return NextResponse.json(
        { error: 'Failed to fetch therapists', therapists: [] },
        { status: 500 }
      );
    }
  }
}