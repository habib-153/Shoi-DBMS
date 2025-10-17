import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Retrieve health logs for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    let sql = `
      SELECT 
        log_id,
        user_id,
        log_date,
        mood_score,
        sleep_hours,
        anxiety_level,
        journal_entry
      FROM user_health_logs
      WHERE user_id = ?
    `;
    
    const sqlParams: any[] = [id];

    if (startDate) {
      sql += ' AND log_date >= ?';
      sqlParams.push(startDate);
    }

    if (endDate) {
      sql += ' AND log_date <= ?';
      sqlParams.push(endDate);
    }

    sql += ' ORDER BY log_date DESC';

    if (limit) {
      sql += ' LIMIT ?';
      sqlParams.push(parseInt(limit));
    }

    const healthLogs = await query(sql, sqlParams);

    return NextResponse.json({
      success: true,
      health_logs: healthLogs
    });
  } catch (error: any) {
    console.error('Error fetching health logs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create or update health log for today
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { mood_score, sleep_hours, anxiety_level, journal_entry, log_date } = body;

    // Validate required fields
    if (mood_score === undefined || sleep_hours === undefined || anxiety_level === undefined) {
      return NextResponse.json(
        { success: false, error: 'mood_score, sleep_hours, and anxiety_level are required' },
        { status: 400 }
      );
    }

    // Use local date instead of UTC to avoid timezone conversion issues
    let today: string;
    if (log_date) {
      today = log_date;
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      today = `${year}-${month}-${day}`;
    }

    // Check if a log already exists for today
    const existingLog = await query(
      'SELECT log_id FROM user_health_logs WHERE user_id = ? AND log_date = ?',
      [id, today]
    );

    if (existingLog.length > 0) {
      // Update existing log
      await query(
        `UPDATE user_health_logs 
         SET mood_score = ?, sleep_hours = ?, anxiety_level = ?, journal_entry = ?
         WHERE user_id = ? AND log_date = ?`,
        [mood_score, sleep_hours, anxiety_level, journal_entry || null, id, today]
      );

      return NextResponse.json({
        success: true,
        message: 'Health log updated successfully',
        log_id: existingLog[0].log_id,
        log_date: today
      });
    } else {
      // Get next log_id
      const maxLogId: any = await query(
        `SELECT IFNULL(MAX(log_id), 0) + 1 as next_id FROM user_health_logs`
      );
      const nextLogId = maxLogId[0]?.next_id || 1;
      
      // Create new log
      const result: any = await query(
        `INSERT INTO user_health_logs 
          (log_id, user_id, log_date, mood_score, sleep_hours, anxiety_level, journal_entry)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nextLogId, id, today, mood_score, sleep_hours, anxiety_level, journal_entry || null]
      );

      return NextResponse.json({
        success: true,
        message: 'Health log created successfully',
        log_id: nextLogId,
        log_date: today
      });
    }
  } catch (error: any) {
    console.error('Error saving health log:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
