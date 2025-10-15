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
    
    console.log('=== SPECIALTIES TABLE ===');
    const [specialties] = await conn.query('SELECT * FROM specialties');
    specialties.forEach(s => console.log(`  ID ${s.specialty_id}: ${s.name}`));
    
    console.log('\n=== THERAPIST_SPECIALTIES TABLE ===');
    const [ts] = await conn.query('SELECT * FROM therapist_specialties WHERE specialty_id = 2');
    console.log(`Found ${ts.length} therapists with specialty_id = 2 (Psychiatrist)`);
    ts.forEach(t => console.log(`  Therapist ID: ${t.therapist_id}`));
    
    console.log('\n=== PSYCHIATRISTS (specialty_id = 2) ===');
    const [psychiatrists] = await conn.query(`
      SELECT 
        t.therapist_id,
        t.name,
        t.email,
        t.Interested_field
      FROM therapists t
      INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
      WHERE ts.specialty_id = 2
    `);
    console.log(`Found ${psychiatrists.length} psychiatrists:`);
    psychiatrists.forEach(p => console.log(`  ID ${p.therapist_id}: ${p.name} (${p.email})`));
    
    await conn.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
