import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API: Fetching analytics for user ID:', id);
    
    // Get total appointments count
    const appointmentCount = await query(
      'SELECT COUNT(*) as total FROM appointments WHERE user_id = ?',
      [id]
    ) as any[];
    
    // Get completed sessions count (sessions with session notes = completed)
    const completedSessions = await query(
      `SELECT COUNT(DISTINCT s.session_id) as completed 
       FROM sessions s
       JOIN appointments a ON s.appointment_id = a.appointment_id
       JOIN session_notes sn ON s.session_id = sn.session_id
       WHERE a.user_id = ?`,
      [id]
    ) as any[];
    
    console.log('Analytics API - Completed count:', completedSessions[0]?.completed);
    
    // Get cancelled appointments count
    const cancelledCount = await query(
      `SELECT COUNT(*) as cancelled 
       FROM appointments 
       WHERE user_id = ? 
       AND status = 'cancelled'`,
      [id]
    ) as any[];
    
    // Get upcoming appointments (appointments WITHOUT session notes, regardless of date)
    const upcomingCount = await query(
      `SELECT COUNT(*) as upcoming 
       FROM appointments a
       LEFT JOIN sessions s ON a.appointment_id = s.appointment_id
       LEFT JOIN session_notes sn ON s.session_id = sn.session_id
       WHERE a.user_id = ? 
       AND sn.note_id IS NULL
       AND a.status != 'cancelled'`,
      [id]
    ) as any[];
    
    console.log('Analytics API - Upcoming count:', upcomingCount[0]?.upcoming);
    
    // Debug: Check all appointments
    const debugAll = await query(
      `SELECT 
        a.appointment_id,
        a.status,
        s.session_id,
        sn.note_id
       FROM appointments a
       LEFT JOIN sessions s ON a.appointment_id = s.appointment_id
       LEFT JOIN session_notes sn ON s.session_id = sn.session_id
       WHERE a.user_id = ?`,
      [id]
    ) as any[];
    
    console.log('Analytics API - All appointments debug:', debugAll);

    // Get actual upcoming appointments details (without session notes, for display)
    const upcomingAppointments = await query(
      `SELECT 
        a.appointment_id,
        a.start_time,
        a.end_time,
        a.status,
        t.name as therapist_name,
        ts.name as specialty_name
       FROM appointments a
       JOIN therapists t ON a.therapist_id = t.therapist_id
       LEFT JOIN therapist_specialties tsp ON t.therapist_id = tsp.therapist_id
       LEFT JOIN specialties ts ON tsp.specialty_id = ts.specialty_id
       LEFT JOIN sessions s ON a.appointment_id = s.appointment_id
       LEFT JOIN session_notes sn ON s.session_id = sn.session_id
       WHERE a.user_id = ?
       AND sn.note_id IS NULL
       AND a.status != 'cancelled'
       ORDER BY a.start_time ASC
       LIMIT 5`,
      [id]
    ) as any[];
    
    // Get mood trends (last 30 days)
    const moodTrends = await query(
      `SELECT 
        DATE(log_date) as date,
        AVG(mood_score) as avg_mood,
        AVG(anxiety_level) as avg_anxiety
       FROM user_health_logs
       WHERE user_id = ?
       AND log_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(log_date)
       ORDER BY date DESC
       LIMIT 7`,
      [id]
    ) as any[];
    
    // Get recent average mood (last 7 days vs previous 7 days)
    const recentMood = await query(
      `SELECT AVG(mood_score) as avg 
       FROM user_health_logs
       WHERE user_id = ?
       AND log_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [id]
    ) as any[];
    
    const previousMood = await query(
      `SELECT AVG(mood_score) as avg 
       FROM user_health_logs
       WHERE user_id = ?
       AND log_date >= DATE_SUB(NOW(), INTERVAL 14 DAY)
       AND log_date < DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [id]
    ) as any[];
    
    // Get total assessments taken
    const assessmentsCount = await query(
      `SELECT COUNT(*) as total 
       FROM assessment_responses
       WHERE user_id = ?`,
      [id]
    ) as any[];

    // Get recent symptoms (last 7 days)
    const recent_symptoms = await query(`
      SELECT 
        us.date_recorded,
        us.severity,
        s.symptom_id,
        s.symptom_name_en,
        s.symptom_name_bn
      FROM user_symptoms us
      JOIN symptoms s ON us.symptom_id = s.symptom_id
      WHERE us.user_id = ?
        AND us.date_recorded >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY us.date_recorded DESC
      LIMIT 10
    `, [id]);

    // Get symptom tracking stats
    const symptomStats = await query(`
      SELECT 
        COUNT(DISTINCT symptom_id) as unique_symptoms,
        COUNT(DISTINCT date_recorded) as tracking_days
      FROM user_symptoms
      WHERE user_id = ?
    `, [id]);
    
    return NextResponse.json({
      success: true,
      analytics: {
        appointments: {
          total_appointments: appointmentCount[0]?.total || 0,
          completed_appointments: completedSessions[0]?.completed || 0,
          cancelled_appointments: cancelledCount[0]?.cancelled || 0,
          upcoming_appointments: upcomingCount[0]?.upcoming || 0,
          upcoming_details: upcomingAppointments
        },
        mood_trend: {
          recent_avg: parseFloat(recentMood[0]?.avg || 0),
          previous_avg: parseFloat(previousMood[0]?.avg || 0)
        },
        health_trends: moodTrends || [],
        assessments: {
          total_assessments: assessmentsCount[0]?.total || 0
        },
        symptoms: {
          recent_symptoms,
          unique_symptoms_tracked: symptomStats[0]?.unique_symptoms || 0,
          total_tracking_days: symptomStats[0]?.tracking_days || 0
        }
      }
    });
    
  } catch (error) {
    console.error('API: Error fetching user analytics:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}