const mysql = require('mysql2/promise');
const fs = require('fs');

async function setupReferralsTable() {
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
    
    console.log('✅ Connected to database: shoi\n');
    
    // Create referrals table
    const createReferralsSQL = `
      CREATE TABLE IF NOT EXISTS referrals (
        referral_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        referring_therapist_id INT NOT NULL,
        referred_to_therapist_id INT NOT NULL,
        session_id INT NULL,
        reason TEXT NOT NULL,
        severity_level ENUM('severe', 'critical') DEFAULT 'severe',
        symptoms TEXT NULL,
        current_medication TEXT NULL,
        additional_notes TEXT NULL,
        status ENUM('pending', 'accepted', 'completed', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user (user_id),
        INDEX idx_referring (referring_therapist_id),
        INDEX idx_referred_to (referred_to_therapist_id),
        INDEX idx_status (status),
        INDEX idx_session (session_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;
    
    await conn.query(createReferralsSQL);
    console.log('✅ Referrals table created successfully!\n');
    
    // Verify table exists
    const [tables] = await conn.query("SHOW TABLES LIKE 'referrals'");
    if (tables.length > 0) {
      console.log('✅ Table verified: referrals exists\n');
      
      // Show table structure
      const [desc] = await conn.query('DESCRIBE referrals');
      console.log('Table structure:');
      desc.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (conn) {
      await conn.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

setupReferralsTable();
