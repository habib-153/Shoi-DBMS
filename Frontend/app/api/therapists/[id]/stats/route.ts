import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'shoi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// GET - Fetch therapist statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await pool.getConnection();
    const therapistId = params.id;

    try {
      // Get total patients (unique users who had appointments with this therapist)
      const [patientsResult] = await connection.execute(
        `SELECT COUNT(DISTINCT user_id) as total_patients 
         FROM appointments 
         WHERE therapist_id = ?`,
        [therapistId]
      );

      // Get completed sessions count
      const [sessionsResult] = await connection.execute(
        `SELECT COUNT(*) as completed_sessions 
         FROM appointments 
         WHERE therapist_id = ? AND status = 'completed'`,
        [therapistId]
      );

      // Get weekly revenue (assuming appointments table has a fees column)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const [revenueResult] = await connection.execute(
        `SELECT COALESCE(SUM(fees), 0) as weekly_revenue 
         FROM appointments 
         WHERE therapist_id = ? 
         AND status = 'completed' 
         AND appointment_date >= ?`,
        [therapistId, weekStart.toISOString().split('T')[0]]
      );

      // Get average rating from therapist_ratings table (if it exists)
      const [ratingResult] = await connection.execute(
        `SELECT COALESCE(AVG(rating), 0) as average_rating 
         FROM therapist_ratings 
         WHERE therapist_id = ?`,
        [therapistId]
      );

      // Get today's appointments count
      const today = new Date().toISOString().split('T')[0];
      const [todayResult] = await connection.execute(
        `SELECT COUNT(*) as today_appointments 
         FROM appointments 
         WHERE therapist_id = ? 
         AND DATE(appointment_date) = ?`,
        [therapistId, today]
      );

      const stats = {
        totalPatients: (patientsResult as any)[0]?.total_patients || 0,
        completedSessions: (sessionsResult as any)[0]?.completed_sessions || 0,
        weeklyRevenue: (revenueResult as any)[0]?.weekly_revenue || 0,
        averageRating: (ratingResult as any)[0]?.average_rating || 0,
        todayAppointments: (todayResult as any)[0]?.today_appointments || 0
      };

      return NextResponse.json(stats);

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching therapist stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch therapist statistics' },
      { status: 500 }
    );
  }
}