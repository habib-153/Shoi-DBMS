import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Check user_symptoms table structure
    const userSymptomsSchema = await query('DESCRIBE user_symptoms');
    
    // Check symptoms table structure
    const symptomsSchema = await query('DESCRIBE symptoms');
    
    // Check existing data
    const symptomsData = await query('SELECT * FROM symptoms ORDER BY symptom_id');
    const userSymptomsData = await query('SELECT * FROM user_symptoms LIMIT 5');
    
    return NextResponse.json({
      success: true,
      user_symptoms_schema: userSymptomsSchema,
      symptoms_schema: symptomsSchema,
      symptoms_count: symptomsData.length,
      symptoms: symptomsData,
      user_symptoms_sample: userSymptomsData
    });
  } catch (error: any) {
    console.error('Schema check error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
