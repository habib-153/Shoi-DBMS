import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting user_symptoms table restructure...');

    // Step 1: Create new table with proper structure
    await query(`
      CREATE TABLE IF NOT EXISTS user_symptoms_new (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        symptom_id INT NOT NULL,
        severity VARCHAR(50),
        date_recorded DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_date (user_id, date_recorded),
        INDEX idx_symptom (symptom_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (symptom_id) REFERENCES symptoms(symptom_id) ON DELETE CASCADE
      )
    `, []);
    console.log('Created user_symptoms_new table');

    // Step 2: Copy existing data
    await query(`
      INSERT INTO user_symptoms_new (user_id, symptom_id, severity, date_recorded)
      SELECT user_id, symptom_id, severity, date_recorded
      FROM user_symptoms
    `, []);
    console.log('Copied existing data');

    // Step 3: Drop old table
    await query('DROP TABLE user_symptoms', []);
    console.log('Dropped old table');

    // Step 4: Rename new table
    await query('RENAME TABLE user_symptoms_new TO user_symptoms', []);
    console.log('Renamed table');

    return NextResponse.json({
      success: true,
      message: 'user_symptoms table restructured successfully - now allows multiple entries per day'
    });
  } catch (error: any) {
    console.error('Error restructuring table:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
