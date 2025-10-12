import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // Define the 9 essential primary symptoms to keep (IDs from the database)
    const essentialSymptomIds = [
      1,   // Low mood
      3,   // Insomnia (sleep difficulty)
      5,   // Anxiety (generalized)
      6,   // Panic attacks
      7,   // Irritability
      8,   // Poor concentration
      13,  // Suicidal ideation
      14,  // Fatigue / low energy
      31   // Social anxiety
    ];

    // Step 1: Delete all user_symptoms records
    await query('DELETE FROM user_symptoms');
    console.log('✅ Deleted all data from user_symptoms table');

    // Step 2: Delete symptoms NOT in the essential list
    const placeholders = essentialSymptomIds.map(() => '?').join(',');
    const deleteResult = await query(
      `DELETE FROM symptoms WHERE symptom_id NOT IN (${placeholders})`,
      essentialSymptomIds
    );
    console.log(`✅ Deleted ${(deleteResult as any).affectedRows} non-essential symptoms`);

    // Step 3: Get the remaining symptoms
    const remainingSymptoms = await query(
      'SELECT symptom_id, symptom_name_en FROM symptoms ORDER BY symptom_id'
    );

    // Step 4: Reset auto-increment counters
    await query('ALTER TABLE user_symptoms AUTO_INCREMENT = 1');

    return NextResponse.json({
      success: true,
      message: 'Successfully reduced to 9 essential symptoms and cleared user_symptoms',
      data: {
        user_symptoms_deleted: 'All records',
        symptoms_remaining: remainingSymptoms,
        total_symptoms: (remainingSymptoms as any[]).length
      }
    });
  } catch (error) {
    console.error('Error cleaning symptoms:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clean symptoms tables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
