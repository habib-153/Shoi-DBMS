import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '678';
    const date = searchParams.get('date') || '2025-10-10';

    // Get symptoms directly from database
    const result = await query(
      `SELECT 
        user_id,
        symptom_id,
        severity,
        DATE_FORMAT(date_recorded, '%Y-%m-%d') as date_recorded,
        CURRENT_TIMESTAMP() as query_time
      FROM user_symptoms 
      WHERE user_id = ? AND DATE(date_recorded) = ?
      ORDER BY symptom_id`,
      [userId, date]
    );

    return NextResponse.json({
      success: true,
      count: result.length,
      query_time: new Date().toISOString(),
      symptoms: result
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
