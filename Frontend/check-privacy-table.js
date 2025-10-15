const mysql = require('mysql2/promise');

async function checkPrivacyTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'shoi'
    });
    
    console.log('✓ Connected to database\n');
    
    // Check if table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'privacy_settings'"
    );
    
    if (tables.length === 0) {
      console.log('❌ privacy_settings table does NOT exist');
      console.log('Creating table...\n');
      
      await connection.execute(`
        CREATE TABLE privacy_settings (
          setting_id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          profile_visibility ENUM('public', 'private', 'friends_only') DEFAULT 'public',
          show_email BOOLEAN DEFAULT FALSE,
          show_phone BOOLEAN DEFAULT FALSE,
          show_appointment_history BOOLEAN DEFAULT FALSE,
          show_session_notes BOOLEAN DEFAULT FALSE,
          allow_referrals BOOLEAN DEFAULT TRUE,
          allow_messages BOOLEAN DEFAULT TRUE,
          allow_notifications BOOLEAN DEFAULT TRUE,
          email_notifications BOOLEAN DEFAULT TRUE,
          sms_notifications BOOLEAN DEFAULT FALSE,
          push_notifications BOOLEAN DEFAULT TRUE,
          share_data_for_research BOOLEAN DEFAULT FALSE,
          two_factor_auth BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_privacy (user_id)
        )
      `);
      
      console.log('✅ Table created successfully!\n');
    }
    
    // Get table structure
    console.log('📋 Table Structure:');
    console.log('═══════════════════════════════════════\n');
    
    const [columns] = await connection.execute('DESCRIBE privacy_settings');
    columns.forEach(col => {
      console.log(`  ${col.Field.padEnd(30)} ${col.Type.padEnd(20)} ${col.Default || 'NULL'}`);
    });
    
    console.log('\n═══════════════════════════════════════\n');
    
    // Check existing data
    const [count] = await connection.execute(
      'SELECT COUNT(*) as total FROM privacy_settings'
    );
    
    console.log(`📊 Total privacy settings: ${count[0].total}\n`);
    
    if (count[0].total > 0) {
      const [sample] = await connection.execute(
        'SELECT * FROM privacy_settings LIMIT 3'
      );
      console.log('Sample data:');
      console.log(sample);
    } else {
      console.log('⚠️  No privacy settings exist yet\n');
      console.log('💡 Tip: Privacy settings will be created automatically when users register');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Database connection closed');
    }
  }
}

checkPrivacyTable();
