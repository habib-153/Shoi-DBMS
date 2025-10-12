import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Retrieve recent symptoms (last 7 days) for dashboard display
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Get symptoms from the last 7 days
    const recentSymptoms = await query(`
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
      ORDER BY us.date_recorded DESC, s.symptom_name_en ASC
    `, [userId]);

    // Get unique dates with symptom counts
    const dailySummary = await query(`
      SELECT 
        date_recorded,
        COUNT(DISTINCT symptom_id) as symptom_count
      FROM user_symptoms
      WHERE user_id = ?
        AND date_recorded >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY date_recorded
      ORDER BY date_recorded DESC
    `, [userId]);

    // Get most frequent symptoms in the last 30 days
    const frequentSymptoms = await query(`
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
        END) as avg_severity
      FROM user_symptoms us
      JOIN symptoms s ON us.symptom_id = s.symptom_id
      WHERE us.user_id = ?
        AND us.date_recorded >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY s.symptom_id, s.symptom_name_en, s.symptom_name_bn
      ORDER BY frequency DESC, avg_severity DESC
      LIMIT 5
    `, [userId]);

    return NextResponse.json({
      success: true,
      recent_symptoms: recentSymptoms,
      daily_summary: dailySummary,
      frequent_symptoms: frequentSymptoms
    });
  } catch (error: any) {
    console.error('Error fetching recent symptoms:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
