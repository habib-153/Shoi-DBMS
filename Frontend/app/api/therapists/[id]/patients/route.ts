import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch patient progress for therapists
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const therapistId = id;
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      // Get all patients for this therapist
      const patients = await query(`
        SELECT DISTINCT
          u.user_id,
          u.name,
          u.email,
          COUNT(a.appointment_id) as total_appointments,
          MAX(a.start_time) as last_appointment,
          COUNT(ar.response_id) as assessment_count,
          AVG(uhl.mood_score) as avg_mood
        FROM users u
        JOIN appointments a ON u.user_id = a.user_id
        LEFT JOIN assessment_responses ar ON u.user_id = ar.user_id
        LEFT JOIN user_health_logs uhl ON u.user_id = uhl.user_id 
          AND uhl.log_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE a.therapist_id = ?
        GROUP BY u.user_id, u.name, u.email
        ORDER BY MAX(a.start_time) DESC
      `, [therapistId]);

      return NextResponse.json({
        success: true,
        patients
      });
    } else {
      // Get detailed progress for specific patient
      
      // Patient basic info
      const patientInfo = await query(`
        SELECT 
          user_id,
          name,
          email,
          date_of_birth,
          gender
        FROM users 
        WHERE user_id = ?
      `, [patientId]);

      // Appointment history with this therapist
      const appointments = await query(`
        SELECT 
          a.appointment_id,
          a.start_time,
          a.end_time,
          a.status,
          s.session_id,
          s.rating_by_user,
          s.duration_min
        FROM appointments a
        LEFT JOIN sessions s ON a.appointment_id = s.appointment_id
        WHERE a.user_id = ? AND a.therapist_id = ?
        ORDER BY a.start_time DESC
        LIMIT 10
      `, [patientId, therapistId]);

      // Health log trends
      const healthLogs = await query(`
        SELECT 
          log_date,
          mood_score,
          sleep_hours,
          anxiety_level,
          journal_entry
        FROM user_health_logs 
        WHERE user_id = ? 
          AND log_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
        ORDER BY log_date DESC
      `, [patientId]);

      // Assessment responses
      const assessments = await query(`
        SELECT 
          ar.response_id,
          ar.submitted_at,
          ar.total_score,
          ar.prelim_insight,
          a.name as assessment_name
        FROM assessment_responses ar
        JOIN assessments a ON ar.assessment_id = a.assessment_id
        WHERE ar.user_id = ?
        ORDER BY ar.submitted_at DESC
        LIMIT 5
      `, [patientId]);

      // Recent symptoms
      const symptoms = await query(`
        SELECT 
          us.date_recorded,
          us.severity,
          s.symptom_name_en,
          s.symptom_name_bn
        FROM user_symptoms us
        JOIN symptoms s ON us.symptom_id = s.symptom_id
        WHERE us.user_id = ? 
          AND us.date_recorded >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ORDER BY us.date_recorded DESC
      `, [patientId]);

      // Session notes (therapist can see all)
      const sessionNotes = await query(`
        SELECT 
          sn.note_id,
          sn.summary,
          sn.homework,
          sn.therapist_private_notes,
          sn.created_at,
          s.session_date,
          a.start_time as appointment_time
        FROM session_notes sn
        JOIN sessions s ON sn.session_id = s.session_id
        JOIN appointments a ON s.appointment_id = a.appointment_id
        WHERE a.user_id = ? AND a.therapist_id = ?
        ORDER BY sn.created_at DESC
        LIMIT 10
      `, [patientId, therapistId]);

      // Resources assigned to patient
      const assignedResources = await query(`
        SELECT 
          r.resource_id,
          r.title,
          r.type,
          ur.assigned_at,
          ur.suggested_by
        FROM user_resources ur
        JOIN resources r ON ur.resource_id = r.resource_id
        WHERE ur.user_id = ? AND ur.suggested_by = ?
        ORDER BY ur.assigned_at DESC
      `, [patientId, therapistId]);

      return NextResponse.json({
        success: true,
        patient_progress: {
          patient_info: patientInfo[0] || null,
          appointments: appointments || [],
          health_logs: healthLogs || [],
          assessments: assessments || [],
          symptoms: symptoms || [],
          session_notes: sessionNotes || [],
          assigned_resources: assignedResources || []
        }
      });
    }

  } catch (error) {
    console.error('Error fetching patient progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient progress' },
      { status: 500 }
    );
  }
}