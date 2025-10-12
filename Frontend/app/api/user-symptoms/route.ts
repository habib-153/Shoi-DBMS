import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Log symptoms for a user on a specific date
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, symptoms, date_recorded } = body;

    console.log('========================================');
    console.log('POST /api/user-symptoms - RECEIVED REQUEST');
    console.log('User ID:', user_id);
    console.log('Symptoms:', JSON.stringify(symptoms, null, 2));
    console.log('Date:', date_recorded);
    console.log('========================================');

    // Validate input
    if (!user_id || !symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      console.error('❌ Validation failed:', { user_id, symptoms });
      return NextResponse.json(
        { success: false, error: 'user_id and symptoms array are required' },
        { status: 400 }
      );
    }

    // Use local date instead of UTC to avoid timezone conversion issues
    let recordDate: string;
    if (date_recorded) {
      recordDate = date_recorded;
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      recordDate = `${year}-${month}-${day}`;
    }
    console.log('📅 Using date:', recordDate);

    // Use INSERT ... ON DUPLICATE KEY UPDATE to add or update symptoms
    // This will add new symptoms or update severity if the symptom already exists for this date
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    for (const symptom of symptoms) {
      try {
        console.log(`💾 Inserting symptom_id: ${symptom.symptom_id}, severity: ${symptom.severity}`);
        
        const result = await query(
          `INSERT INTO user_symptoms (user_id, symptom_id, severity, date_recorded) 
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE severity = VALUES(severity)`,
          [user_id, symptom.symptom_id, symptom.severity, recordDate]
        );
        
        console.log(`✅ Inserted/Updated symptom ${symptom.symptom_id}:`, result);
        successCount++;
      } catch (err: any) {
        console.error(`❌ Failed to insert symptom ${symptom.symptom_id}:`, err.message);
        errorCount++;
        errors.push({ symptom_id: symptom.symptom_id, error: err.message });
      }
    }

    console.log('========================================');
    console.log(`✅ Success: ${successCount}, ❌ Errors: ${errorCount}`);
    console.log('========================================');

    if (errorCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Partial success: ${successCount} saved, ${errorCount} failed`,
        count: successCount,
        errors: errors,
        date: recordDate
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Symptoms logged successfully',
      count: successCount,
      date: recordDate
    });
  } catch (error: any) {
    console.error('Error logging symptoms:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET - Retrieve symptom history for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    console.log('GET /api/user-symptoms - userId:', userId, 'startDate:', startDate, 'endDate:', endDate);

    let sql = `
      SELECT 
        us.user_id,
        us.symptom_id,
        us.severity,
        DATE_FORMAT(us.date_recorded, '%Y-%m-%d') as date_recorded,
        s.symptom_name_en,
        s.symptom_name_bn,
        s.description_en,
        s.description_bn
      FROM user_symptoms us
      JOIN symptoms s ON us.symptom_id = s.symptom_id
      WHERE us.user_id = ?
    `;
    
    const params: any[] = [userId];

    if (startDate) {
      sql += ' AND DATE(us.date_recorded) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND DATE(us.date_recorded) <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY us.date_recorded DESC, s.symptom_name_en ASC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const symptoms = await query(sql, params);
    console.log('Found symptoms:', symptoms.length);

    // Group by date for easier frontend consumption
    const groupedByDate: { [key: string]: any[] } = {};
    symptoms.forEach((symptom: any) => {
      // date_recorded is now a formatted string 'YYYY-MM-DD'
      const dateKey = symptom.date_recorded;
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push({
        symptom_id: symptom.symptom_id,
        symptom_name_en: symptom.symptom_name_en,
        symptom_name_bn: symptom.symptom_name_bn,
        severity: symptom.severity,
        description_en: symptom.description_en,
        description_bn: symptom.description_bn
      });
    });

    console.log('Grouped by dates:', Object.keys(groupedByDate));

    return NextResponse.json({
      success: true,
      total: symptoms.length,
      symptoms: symptoms,
      groupedByDate: groupedByDate
    });
  } catch (error: any) {
    console.error('Error fetching symptoms:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
