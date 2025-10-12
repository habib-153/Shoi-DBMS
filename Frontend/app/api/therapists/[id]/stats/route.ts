import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch therapist statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const therapistId = resolvedParams.id;

    // Get total patients (unique users who had appointments with this therapist)
    const patientsResult = await query(
      `SELECT COUNT(DISTINCT user_id) as total_patients 
       FROM appointments 
       WHERE therapist_id = ?`,
      [therapistId]
    ) as any[];

    // Get completed sessions count
    const sessionsResult = await query(
      `SELECT COUNT(*) as completed_sessions 
       FROM sessions s
       JOIN appointments a ON s.appointment_id = a.appointment_id
       WHERE a.therapist_id = ?`,
      [therapistId]
    ) as any[];

    // Get today's appointments count - use local date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    const todayResult = await query(
      `SELECT COUNT(*) as today_appointments 
       FROM appointments 
       WHERE therapist_id = ? 
       AND DATE(start_time) = ?`,
      [therapistId, today]
    ) as any[];

    // Get weekly revenue - simplified calculation based on completed appointments
    const weekStartDate = new Date();
    weekStartDate.setDate(weekStartDate.getDate() - 7);
    const weekYear = weekStartDate.getFullYear();
    const weekMonth = String(weekStartDate.getMonth() + 1).padStart(2, '0');
    const weekDay = String(weekStartDate.getDate()).padStart(2, '0');
    const weekStartStr = `${weekYear}-${weekMonth}-${weekDay}`;
    
    const weeklyAppointments = await query(
      `SELECT COUNT(*) as count
       FROM appointments a
       WHERE a.therapist_id = ? 
       AND a.status IN ('completed', 'paid')
       AND DATE(a.start_time) >= ?`,
      [therapistId, weekStartStr]
    ) as any[];
    
    // Estimate revenue: count * average fee (using 1500 as default)
    const weeklyRevenue = (weeklyAppointments[0]?.count || 0) * 1500;

    // Get average rating from sessions
    const ratingResult = await query(
      `SELECT AVG(s.rating_by_user) as avg_rating 
       FROM sessions s
       JOIN appointments a ON s.appointment_id = a.appointment_id
       WHERE a.therapist_id = ? 
       AND s.rating_by_user IS NOT NULL`,
      [therapistId]
    ) as any[];

    const stats = {
      totalPatients: parseInt(patientsResult[0]?.total_patients) || 0,
      completedSessions: parseInt(sessionsResult[0]?.completed_sessions) || 0,
      weeklyRevenue: weeklyRevenue,
      averageRating: parseFloat(ratingResult[0]?.avg_rating || 0).toFixed(1),
      todayAppointments: parseInt(todayResult[0]?.today_appointments) || 0
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching therapist stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch therapist statistics',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}