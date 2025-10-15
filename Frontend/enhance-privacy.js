const mysql = require('mysql2/promise');

async function enhancePrivacy() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'shoi'
    });
    
    console.log('✓ Connected to database\n');
    console.log('🔧 Enhancing privacy settings...\n');
    
    // Get existing columns
    const [existingCols] = await connection.execute('DESCRIBE privacy_settings');
    const existingColNames = existingCols.map(c => c.Field);
    
    const newColumns = [
      { name: 'profile_visibility', type: "ENUM('public', 'private', 'connections_only') DEFAULT 'public'", after: 'stealth_icon' },
      { name: 'show_profile_picture', type: 'BOOLEAN DEFAULT TRUE', after: 'profile_visibility' },
      { name: 'show_real_name', type: 'BOOLEAN DEFAULT TRUE', after: 'show_profile_picture' },
      { name: 'show_email', type: 'BOOLEAN DEFAULT FALSE', after: 'show_real_name' },
      { name: 'show_phone', type: 'BOOLEAN DEFAULT FALSE', after: 'show_email' },
      { name: 'show_last_active', type: 'BOOLEAN DEFAULT TRUE', after: 'show_phone' },
      { name: 'show_appointment_history', type: 'BOOLEAN DEFAULT FALSE', after: 'show_last_active' },
      { name: 'show_session_count', type: 'BOOLEAN DEFAULT FALSE', after: 'show_appointment_history' },
      { name: 'allow_therapist_reviews', type: 'BOOLEAN DEFAULT TRUE', after: 'show_session_count' },
      { name: 'allow_messages', type: 'BOOLEAN DEFAULT TRUE', after: 'allow_therapist_reviews' },
      { name: 'allow_referrals', type: 'BOOLEAN DEFAULT TRUE', after: 'allow_messages' },
      { name: 'allow_family_connections', type: 'BOOLEAN DEFAULT TRUE', after: 'allow_referrals' },
      { name: 'email_notifications', type: 'BOOLEAN DEFAULT TRUE', after: 'allow_family_connections' },
      { name: 'sms_notifications', type: 'BOOLEAN DEFAULT FALSE', after: 'email_notifications' },
      { name: 'push_notifications', type: 'BOOLEAN DEFAULT TRUE', after: 'sms_notifications' },
      { name: 'appointment_reminders', type: 'BOOLEAN DEFAULT TRUE', after: 'push_notifications' },
      { name: 'session_notes_alerts', type: 'BOOLEAN DEFAULT TRUE', after: 'appointment_reminders' },
      { name: 'referral_alerts', type: 'BOOLEAN DEFAULT TRUE', after: 'session_notes_alerts' },
      { name: 'marketing_emails', type: 'BOOLEAN DEFAULT FALSE', after: 'referral_alerts' },
      { name: 'share_anonymous_data', type: 'BOOLEAN DEFAULT FALSE', after: 'share_data_with_therapist' },
      { name: 'allow_data_export', type: 'BOOLEAN DEFAULT TRUE', after: 'share_anonymous_data' },
      { name: 'two_factor_enabled', type: 'BOOLEAN DEFAULT FALSE', after: 'allow_data_export' },
      { name: 'login_alerts', type: 'BOOLEAN DEFAULT TRUE', after: 'two_factor_enabled' },
      { name: 'session_timeout_minutes', type: 'INT DEFAULT 30', after: 'login_alerts' },
      { name: 'incognito_mode', type: 'BOOLEAN DEFAULT FALSE', after: 'session_timeout_minutes' },
      { name: 'anonymous_browsing', type: 'BOOLEAN DEFAULT FALSE', after: 'incognito_mode' },
      { name: 'hide_from_search', type: 'BOOLEAN DEFAULT FALSE', after: 'anonymous_browsing' },
      { name: 'ghost_mode_until', type: 'DATETIME NULL', after: 'hide_from_search' },
      { name: 'block_screenshots', type: 'BOOLEAN DEFAULT FALSE', after: 'ghost_mode_until' },
      { name: 'auto_delete_messages_days', type: 'INT DEFAULT NULL', after: 'block_screenshots' },
      { name: 'require_password_for_notes', type: 'BOOLEAN DEFAULT FALSE', after: 'auto_delete_messages_days' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP', after: 'require_password_for_notes' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', after: 'created_at' }
    ];
    
    let added = 0;
    let skipped = 0;
    
    for (const col of newColumns) {
      if (!existingColNames.includes(col.name)) {
        try {
          await connection.execute(
            `ALTER TABLE privacy_settings ADD COLUMN ${col.name} ${col.type} AFTER ${col.after}`
          );
          console.log(`  ✓ Added: ${col.name}`);
          added++;
        } catch (err) {
          console.error(`  ⚠️  Failed to add ${col.name}: ${err.message.substring(0, 60)}`);
        }
      } else {
        skipped++;
      }
    }
    
    console.log(`\n  Added ${added} columns, skipped ${skipped} (already exist)\n`);
    
    // Create supporting tables
    console.log('Creating supporting tables...\n');
    
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS privacy_activity_log (
          log_id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          action_type ENUM('settings_changed', 'privacy_mode_enabled', 'data_accessed', 'data_exported', 'account_locked') NOT NULL,
          action_details TEXT,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          INDEX idx_user_activity (user_id, created_at)
        )
      `);
      console.log('  ✓ Created: privacy_activity_log');
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.error(`  ⚠️  ${err.message.substring(0, 80)}`);
      }
    }
    
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS blocked_users (
          block_id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          blocked_user_id INT NOT NULL,
          reason VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (blocked_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          UNIQUE KEY unique_block (user_id, blocked_user_id)
        )
      `);
      console.log('  ✓ Created: blocked_users');
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.error(`  ⚠️  ${err.message.substring(0, 80)}`);
      }
    }
    
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS trusted_contacts (
          trust_id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          trusted_user_id INT NOT NULL,
          trust_level ENUM('view_profile', 'view_appointments', 'emergency_contact') DEFAULT 'view_profile',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (trusted_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          UNIQUE KEY unique_trust (user_id, trusted_user_id)
        )
      `);
      console.log('  ✓ Created: trusted_contacts');
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.error(`  ⚠️  ${err.message.substring(0, 80)}`);
      }
    }
    
    console.log('\n═══════════════════════════════════════════');
    console.log('✅ Privacy System Enhanced!');
    console.log('═══════════════════════════════════════════\n');
    
    // Show final status
    const [finalCols] = await connection.execute('DESCRIBE privacy_settings');
    console.log(`📊 Total columns in privacy_settings: ${finalCols.length}\n`);
    
    console.log('✨ New Features:');
    console.log('   • Profile Visibility Controls');
    console.log('   • Activity History Settings  ');
    console.log('   • Communication Preferences');
    console.log('   • Notification Management');
    console.log('   • Data Sharing Controls');
    console.log('   • Security Features (2FA, Login Alerts)');
    console.log('   • Privacy Zones (Incognito, Ghost Mode)');
    console.log('   • Advanced Features (Screenshot Block, Auto-Delete)');
    console.log('   • Blocked Users System');
    console.log('   • Trusted Contacts System');
    console.log('   • Privacy Activity Logging\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✓ Database connection closed\n');
    }
  }
}

enhancePrivacy();
