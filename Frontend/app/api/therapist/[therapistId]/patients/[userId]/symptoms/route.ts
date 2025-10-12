import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Retrieve symptoms for a specific patient (therapist view)
export async function GET(
  request: NextRequest,
  { params }: { params: { therapistId: string; userId: string } }
) {
  try {
    const { therapistId, userId } = params;
    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days') || '30';

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

    // Get patient's symptoms for the specified period
    const symptoms = await query(`
      SELECT 
        us.date_recorded,
        us.severity,
        s.symptom_id,
        s.symptom_name_en,
        s.symptom_name_bn,
        s.description_en
      FROM user_symptoms us
      JOIN symptoms s ON us.symptom_id = s.symptom_id
      WHERE us.user_id = ?
        AND us.date_recorded >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY us.date_recorded DESC, s.symptom_name_en ASC
    `, [userId, parseInt(days)]);

    // Group by date
    const groupedByDate: { [key: string]: any[] } = {};
    symptoms.forEach((symptom: any) => {
      // If date_recorded is already a string (YYYY-MM-DD), use it directly
      // If it's a Date object, format it to local date string
      let dateKey: string;
      if (typeof symptom.date_recorded === 'string') {
        dateKey = symptom.date_recorded;
      } else {
        const d = new Date(symptom.date_recorded);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dateKey = `${year}-${month}-${day}`;
      }
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(symptom);
    });

    // Get frequency analysis
    const frequencyAnalysis = await query(`
      SELECT 
        s.symptom_id,
        s.symptom_name_en,
        s.symptom_name_bn,
        COUNT(*) as frequency,
        AVG(CASE 
          WHEN us.severity = 'Mild' THEN 1
          WHEN us.severity = 'Moderate' THEN 2
          WHEN us.severity = 'Severe' THEN 3
          ELSE 2
        END) as avg_severity_score
      FROM user_symptoms us
      JOIN symptoms s ON us.symptom_id = s.symptom_id
      WHERE us.user_id = ?
        AND us.date_recorded >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY s.symptom_id, s.symptom_name_en, s.symptom_name_bn
      ORDER BY frequency DESC, avg_severity_score DESC
    `, [userId, parseInt(days)]);

    // Get severity trends
    const severityTrends = await query(`
      SELECT 
        date_recorded,
        SUM(CASE WHEN severity = 'Severe' THEN 1 ELSE 0 END) as severe_count,
        SUM(CASE WHEN severity = 'Moderate' THEN 1 ELSE 0 END) as moderate_count,
        SUM(CASE WHEN severity = 'Mild' THEN 1 ELSE 0 END) as mild_count,
        COUNT(*) as total_symptoms
      FROM user_symptoms
      WHERE user_id = ?
        AND date_recorded >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY date_recorded
      ORDER BY date_recorded ASC
    `, [userId, parseInt(days)]);

    return NextResponse.json({
      success: true,
      patient_id: userId,
      period_days: parseInt(days),
      total_entries: symptoms.length,
      symptoms,
      grouped_by_date: groupedByDate,
      frequency_analysis: frequencyAnalysis,
      severity_trends: severityTrends
    });
  } catch (error: any) {
    console.error('Error fetching patient symptoms:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
