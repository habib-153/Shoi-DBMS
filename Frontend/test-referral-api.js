const mysql = require('mysql2/promise');
const fs = require('fs');

async function testReferralAPI() {
  let conn;
  try {
    const env = fs.readFileSync('.env.local', 'utf-8').split('\n');
    const config = {};
    env.forEach(l => {
      const m = l.match(/^([^#=]+)=(.+)$/);
      if (m) config[m[1].trim()] = m[2].trim();
    });
    
    conn = await mysql.createConnection({
      host: config.MYSQL_HOST || 'localhost',
      user: config.MYSQL_USER || 'root',
      password: config.MYSQL_PASSWORD || '',
      database: 'shoi'
    });
    
    console.log('Testing Referral API Requirements...\n');
    
    // Test 1: Check if we can verify a psychiatrist
    console.log('Test 1: Verify psychiatrist check query');
    const therapist_id = 194; // Example psychiatrist ID from our list
    
    const [psychiatristCheck] = await conn.query(`
      SELECT t.therapist_id, t.name, t.Interested_field, ts.specialty_id
      FROM therapists t
      INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
      WHERE t.therapist_id = ?
    `, [therapist_id]);
    
    if (psychiatristCheck.length > 0) {
      console.log(`✅ Found therapist: ${psychiatristCheck[0].name}`);
      console.log(`   specialty_id: ${psychiatristCheck[0].specialty_id}`);
      console.log(`   Is psychiatrist: ${psychiatristCheck[0].specialty_id === 2 ? 'YES' : 'NO'}`);
    } else {
      console.log('❌ Therapist not found in therapist_specialties');
    }
    
    // Test 2: Try the exact INSERT query
    console.log('\nTest 2: Testing INSERT into referrals table');
    console.log('(Will rollback after test)\n');
    
    await conn.beginTransaction();
    
    try {
      const [result] = await conn.query(`
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
      `, [
        1, // test user_id
        211, // test referring therapist
        194, // test psychiatrist
        null,
        'Test referral',
        'severe',
        'Test symptoms',
        null,
        null
      ]);
      
      console.log(`✅ INSERT successful! referral_id: ${result.insertId}`);
      
      // Rollback the test
      await conn.rollback();
      console.log('✅ Test rolled back (no data saved)');
      
    } catch (error) {
      await conn.rollback();
      console.error('❌ INSERT failed:', error.message);
    }
    
    // Test 3: Check users table
    console.log('\nTest 3: Check if users table exists and has data');
    const [users] = await conn.query('SELECT user_id, name, email FROM users LIMIT 3');
    console.log(`✅ Found ${users.length} users`);
    users.forEach(u => console.log(`   - ID ${u.user_id}: ${u.name}`));
    
    // Test 4: Check sessions table
    console.log('\nTest 4: Check if sessions table exists');
    const [tables] = await conn.query("SHOW TABLES LIKE 'sessions'");
    if (tables.length > 0) {
      const [sessions] = await conn.query('SELECT COUNT(*) as count FROM sessions');
      console.log(`✅ sessions table exists with ${sessions[0].count} records`);
    } else {
      console.log('⚠️ sessions table does NOT exist');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (conn) await conn.end();
  }
}

testReferralAPI();
