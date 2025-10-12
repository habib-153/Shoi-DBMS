import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // Delete all data from user_symptoms table first (due to foreign key)
    await query('DELETE FROM user_symptoms');
    console.log('✅ Deleted all data from user_symptoms table');

    // Delete all data from symptoms table
    await query('DELETE FROM symptoms');
    console.log('✅ Deleted all data from symptoms table');

    // Reset auto-increment counters
    await query('ALTER TABLE user_symptoms AUTO_INCREMENT = 1');
    await query('ALTER TABLE symptoms AUTO_INCREMENT = 1');

    return NextResponse.json({
      success: true,
      message: 'Successfully cleared symptoms and user_symptoms tables',
      deleted: {
        symptoms: 'All rows deleted',
        user_symptoms: 'All rows deleted'
      }
    });
  } catch (error) {
    console.error('Error clearing symptoms tables:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear symptoms tables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
