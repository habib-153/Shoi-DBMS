const mysql = require('mysql2/promise');
const fs = require('fs');

async function testAPI() {
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
    
    console.log('Testing the EXACT query from API...\n');
    
    const sql = `
      SELECT 
        t.therapist_id,
        t.name,
        t.email,
        t.gender,
        t.license_no,
        t.years_experience,
        t.rating,
        t.bio,
        t.educational_info,
        t.fees_min,
        t.fees_max,
        t.languages,
        t.Interested_field,
        t.image,
        COUNT(DISTINCT a.user_id) as patient_count,
        0 as pending_referrals
      FROM therapists t
      INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
      LEFT JOIN appointments a ON t.therapist_id = a.therapist_id
      WHERE ts.specialty_id = 2
      GROUP BY t.therapist_id, t.name, t.email, t.gender, t.license_no, t.years_experience, 
               t.rating, t.bio, t.educational_info, t.fees_min, t.fees_max, t.languages, 
               t.Interested_field, t.image
      ORDER BY t.rating DESC, t.years_experience DESC
      LIMIT 5
    `;
    
    console.log('Executing query...');
    const [results] = await conn.query(sql);
    
    console.log(`✅ Query successful! Found ${results.length} psychiatrists\n`);
    
    if (results.length > 0) {
      console.log('Sample psychiatrist:');
      const p = results[0];
      console.log(`  ID: ${p.therapist_id}`);
      console.log(`  Name: ${p.name}`);
      console.log(`  Email: ${p.email}`);
      console.log(`  Experience: ${p.years_experience} years`);
      console.log(`  Fees: ${p.fees_min} - ${p.fees_max}`);
    } else {
      console.log('❌ No results! Checking why...\n');
      
      // Check if referrals table exists
      const [tables] = await conn.query("SHOW TABLES LIKE 'referrals'");
      if (tables.length === 0) {
        console.log('⚠️ WARNING: referrals table does NOT exist!');
        console.log('This is causing the query to fail.\n');
        console.log('Solution: Remove the referrals join from the query');
      }
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    
    if (error.message.includes('referrals')) {
      console.log('\n⚠️ Problem: referrals table does not exist!');
      console.log('The API query is trying to LEFT JOIN with a missing table.');
      console.log('\nSolution: Update the API to work without referrals table.');
    }
  } finally {
    if (conn) await conn.end();
  }
}

testAPI();
