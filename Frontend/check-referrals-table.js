const mysql = require('mysql2/promise');

async function checkReferralsTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'shoi'
  });

  try {
    console.log('\n=== CHECKING REFERRALS TABLE ===\n');

    // Check table structure
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'shoi' AND TABLE_NAME = 'referrals'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('Table columns:');
    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (Nullable: ${col.IS_NULLABLE}, Default: ${col.COLUMN_DEFAULT || 'NONE'})`);
    });

    // Check for any existing referrals
    const [referrals] = await connection.query('SELECT * FROM referrals LIMIT 5');
    console.log(`\nExisting referrals: ${referrals.length}`);

    // Test a simple INSERT
    console.log('\n=== TESTING INSERT ===');
    await connection.query('START TRANSACTION');

    try {
      const [result] = await connection.query(`
        INSERT INTO referrals (
          user_id,
          referring_therapist_id,
          referred_to_therapist_id,
          session_id,
          reason,
          severity_level,
          symptoms,
          current_medication,
          additional_notes,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [1, 1, 121, 1, 'Test reason', 'severe', 'Test symptoms', 'Test meds', 'Test notes']);

      console.log('✅ INSERT successful! referral_id:', result.insertId);

      // Roll back the test
      await connection.query('ROLLBACK');
      console.log('✅ Test rolled back (no data saved)');
    } catch (insertError) {
      console.error('❌ INSERT failed:', insertError.message);
      await connection.query('ROLLBACK');
    }

    // Check if session_id 1 exists
    const [sessions] = await connection.query('SELECT session_id FROM sessions LIMIT 5');
    console.log(`\n✅ Found ${sessions.length} sessions in database`);
    if (sessions.length > 0) {
      console.log('Sample session IDs:', sessions.map(s => s.session_id).join(', '));
    }

    // Check what the user in the screenshot is trying to do
    // Based on the screenshot, they're selecting "Mehedi Kabir"
    const [mehedi] = await connection.query(`
      SELECT t.therapist_id, t.name, t.email, ts.specialty_id
      FROM therapists t
      LEFT JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
      WHERE t.email LIKE '%mehedi.kabir%' OR t.name LIKE '%Mehedi Kabir%'
    `);

    if (mehedi.length > 0) {
      console.log('\n=== MEHEDI KABIR INFO ===');
      mehedi.forEach(m => {
        console.log(`  ID: ${m.therapist_id}, Name: ${m.name}, Email: ${m.email}, specialty_id: ${m.specialty_id}`);
        if (m.specialty_id !== 2) {
          console.log(`  ⚠️ WARNING: Mehedi Kabir has specialty_id ${m.specialty_id}, not 2 (psychiatrist)!`);
        }
      });
    }

  } finally {
    await connection.end();
  }
}

checkReferralsTable().catch(console.error);
