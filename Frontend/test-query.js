const mysql = require('mysql2/promise');
const fs = require('fs');

async function test() {
  try {
    const env = fs.readFileSync('.env.local', 'utf-8').split('\n');
    const config = {};
    env.forEach(l => {
      const m = l.match(/^([^#=]+)=(.+)$/);
      if (m) config[m[1].trim()] = m[2].trim();
    });
    
    const conn = await mysql.createConnection({
      host: config.MYSQL_HOST || 'localhost',
      user: config.MYSQL_USER || 'root',
      password: config.MYSQL_PASSWORD || '',
      database: config.MYSQL_DATABASE || 'shoi'
    });
    
    console.log('Testing the EXACT query from the API...\n');
    
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
        COUNT(DISTINCT CASE WHEN r.status = 'pending' THEN r.referral_id END) as pending_referrals
      FROM therapists t
      INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
      LEFT JOIN appointments a ON t.therapist_id = a.therapist_id
      LEFT JOIN referrals r ON t.therapist_id = r.referred_to_therapist_id
      WHERE ts.specialty_id = 2
      GROUP BY t.therapist_id
      ORDER BY t.rating DESC, t.years_experience DESC
    `;
    
    const [psychiatrists] = await conn.query(sql);
    
    console.log(`✅ SUCCESS! Found ${psychiatrists.length} psychiatrists\n`);
    console.log('First 5 psychiatrists:');
    psychiatrists.slice(0, 5).forEach(p => {
      console.log(`  - ID ${p.therapist_id}: ${p.name}`);
      console.log(`    Email: ${p.email}`);
      console.log(`    Experience: ${p.years_experience} years`);
      console.log(`    Fees: ${p.fees_min}-${p.fees_max}`);
      console.log(`    Rating: ${p.rating}`);
      console.log('');
    });
    
    await conn.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
