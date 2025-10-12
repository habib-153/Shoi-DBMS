import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { therapistId: string; userId: string } }
) {
  try {
    const { therapistId, userId } = params;

    // Verify therapist has access to this patient (has had at least one appointment)
    const hasAccess = await query(`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE therapist_id = ? AND user_id = ?
    `, [therapistId, userId]);

    if (hasAccess[0].count === 0) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to patient data' },
        { status: 403 }
      );
    }

    // Get patient basic info
    const patientInfo = await query(`
      SELECT user_id, name, email, phone, date_of_birth, gender
      FROM users
      WHERE user_id = ?
    `, [userId]);

    // Get all health logs (last 90 days)
    const healthLogs = await query(`
      SELECT 
        log_id,
        log_date,
        mood_score,
        sleep_hours,
        anxiety_level,
        journal_entry
      FROM user_health_logs
      WHERE user_id = ?
        AND log_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      ORDER BY log_date DESC
    `, [userId]);

    // Get all symptoms (last 90 days)
    const symptoms = await query(`
      SELECT 
        DATE_FORMAT(us.date_recorded, '%Y-%m-%d') as date_recorded,
        us.severity,
        s.symptom_id,
        s.symptom_name_en,
        s.symptom_name_bn,
        s.description_en
      FROM user_symptoms us
      JOIN symptoms s ON us.symptom_id = s.symptom_id
      WHERE us.user_id = ?
        AND us.date_recorded >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      ORDER BY us.date_recorded DESC, s.symptom_name_en ASC
    `, [userId]);

    // Group symptoms by date
    const symptomsByDate: { [key: string]: any[] } = {};
    symptoms.forEach((symptom: any) => {
      const dateKey = symptom.date_recorded; // Already formatted as 'YYYY-MM-DD'
      if (!symptomsByDate[dateKey]) {
        symptomsByDate[dateKey] = [];
      }
      symptomsByDate[dateKey].push(symptom);
    });

    // Get symptom frequency analysis
    const symptomFrequency = await query(`
      SELECT 
        s.symptom_id,
        s.symptom_name_en,
        COUNT(*) as frequency,
        AVG(CASE 
          WHEN us.severity = 'Mild' THEN 1
          WHEN us.severity = 'Moderate' THEN 2
          WHEN us.severity = 'Severe' THEN 3
          ELSE 2
        END) as avg_severity_score,
        MAX(us.date_recorded) as last_reported
      FROM user_symptoms us
      JOIN symptoms s ON us.symptom_id = s.symptom_id
      WHERE us.user_id = ?
        AND us.date_recorded >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY s.symptom_id, s.symptom_name_en
      ORDER BY frequency DESC, avg_severity_score DESC
    `, [userId]);

    // Get mood trends
    const moodTrends = await query(`
      SELECT 
        log_date,
        mood_score,
        anxiety_level,
        sleep_hours
      FROM user_health_logs
      WHERE user_id = ?
        AND log_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      ORDER BY log_date ASC
    `, [userId]);

    // Get all sessions history
    const sessions = await query(`
      SELECT 
        s.session_id,
        s.session_date,
        a.start_time,
        a.end_time,
        a.status as appointment_status
      FROM sessions s
      JOIN appointments a ON s.appointment_id = a.appointment_id
      WHERE a.therapist_id = ? AND a.user_id = ?
      ORDER BY s.session_date DESC
    `, [therapistId, userId]);

    // Get session notes
    const sessionNotes = await query(`
      SELECT 
        sn.note_id,
        sn.session_id,
        sn.summary,
        sn.homework,
        sn.therapist_private_notes,
        sn.visible_to_user,
        sn.created_at,
        s.session_date
      FROM session_notes sn
      JOIN sessions s ON sn.session_id = s.session_id
      JOIN appointments a ON s.appointment_id = a.appointment_id
      WHERE a.therapist_id = ? AND a.user_id = ?
      ORDER BY s.session_date DESC
    `, [therapistId, userId]);

    // Calculate statistics
    const totalHealthLogs = healthLogs.length;
    const totalSymptomEntries = symptoms.length;
    const totalSessions = sessions.length;
    
    const avgMood = healthLogs.length > 0
      ? healthLogs.reduce((sum: number, log: any) => sum + (log.mood_score || 0), 0) / healthLogs.length
      : null;
    
    const avgAnxiety = healthLogs.length > 0
      ? healthLogs.reduce((sum: number, log: any) => sum + (log.anxiety_level || 0), 0) / healthLogs.length
      : null;

    const avgSleep = healthLogs.length > 0
      ? healthLogs.reduce((sum: number, log: any) => sum + (parseFloat(log.sleep_hours) || 0), 0) / healthLogs.length
      : null;

    return NextResponse.json({
      success: true,
      patient: patientInfo[0],
      statistics: {
        total_health_logs: totalHealthLogs,
        total_symptom_entries: totalSymptomEntries,
        total_sessions: totalSessions,
        avg_mood: avgMood != null ? parseFloat(avgMood.toFixed(1)) : null,
        avg_anxiety: avgAnxiety != null ? parseFloat(avgAnxiety.toFixed(1)) : null,
        avg_sleep: avgSleep != null ? parseFloat(avgSleep.toFixed(1)) : null,
        unique_symptoms: symptomFrequency.length
      },
      health_logs: healthLogs,
      symptoms: {
        all: symptoms,
        grouped_by_date: symptomsByDate,
        frequency_analysis: symptomFrequency
      },
      mood_trends: moodTrends,
      sessions: sessions,
      session_notes: sessionNotes
    });

  } catch (error: any) {
    console.error('Error fetching patient records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
