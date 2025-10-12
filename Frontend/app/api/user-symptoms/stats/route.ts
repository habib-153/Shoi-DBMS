import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Retrieve symptom statistics and trends
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

    // Total unique symptoms tracked
    const totalUniqueSymptoms = await query(`
      SELECT COUNT(DISTINCT symptom_id) as count
      FROM user_symptoms
      WHERE user_id = ?
    `, [userId]);

    // Total tracking days
    const totalDays = await query(`
      SELECT COUNT(DISTINCT date_recorded) as count
      FROM user_symptoms
      WHERE user_id = ?
    `, [userId]);

    // Symptom trend over last 30 days (count per day)
    const trendData = await query(`
      SELECT 
        date_recorded,
        COUNT(DISTINCT symptom_id) as symptom_count
      FROM user_symptoms
      WHERE user_id = ?
        AND date_recorded >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY date_recorded
      ORDER BY date_recorded ASC
    `, [userId]);

    // Severity distribution
    const severityDistribution = await query(`
      SELECT 
        severity,
        COUNT(*) as count
      FROM user_symptoms
      WHERE user_id = ?
      GROUP BY severity
    `, [userId]);

    // Most improved symptom (appearing less frequently over time)
    const improvement = await query(`
      SELECT 
        symptom_name_en,
        symptom_name_bn,
        recent_count,
        previous_count
      FROM (
        SELECT 
          s.symptom_name_en,
          s.symptom_name_bn,
          SUM(CASE WHEN us.date_recorded >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as recent_count,
          SUM(CASE WHEN us.date_recorded BETWEEN DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as previous_count
        FROM user_symptoms us
        JOIN symptoms s ON us.symptom_id = s.symptom_id
        WHERE us.user_id = ?
          AND us.date_recorded >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
        GROUP BY s.symptom_id, s.symptom_name_en, s.symptom_name_bn
      ) AS symptom_trends
      WHERE previous_count > recent_count
      ORDER BY (previous_count - recent_count) DESC
      LIMIT 3
    `, [userId]);

    return NextResponse.json({
      success: true,
      stats: {
        total_unique_symptoms: totalUniqueSymptoms[0]?.count || 0,
        total_tracking_days: totalDays[0]?.count || 0,
        trend_data: trendData,
        severity_distribution: severityDistribution,
        improvements: improvement
      }
    });
  } catch (error: any) {
    console.error('Error fetching symptom stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
