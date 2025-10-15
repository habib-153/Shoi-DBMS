const mysql = require('mysql2/promise');
const fs = require('fs');

async function createNotificationsTable() {
  let conn;
  try {
    // Read database config
    const env = fs.readFileSync('.env.local', 'utf-8').split('\n');
    const config = {};
    env.forEach(l => {
      const m = l.match(/^([^#=]+)=(.+)$/);
      if (m) config[m[1].trim()] = m[2].trim();
    });
    
    // Connect to database
    conn = await mysql.createConnection({
      host: config.MYSQL_HOST || 'localhost',
      user: config.MYSQL_USER || 'root',
      password: config.MYSQL_PASSWORD || '',
      database: 'shoi'
    });
    
    console.log('✅ Connected to database: shoi\n');
    
    // Create notifications table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_type ENUM('user', 'therapist') NOT NULL,
        recipient_id INT NOT NULL,
        sender_type ENUM('user', 'therapist', 'system') DEFAULT 'system',
        sender_id INT NULL,
        notification_type ENUM('referral', 'appointment', 'message', 'session_note', 'system') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        related_id INT NULL,
        action_url VARCHAR(500) NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        
        INDEX idx_recipient (recipient_type, recipient_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;
    
    await conn.query(createTableSQL);
    console.log('✅ Notifications table created successfully!\n');
    
    // Verify table exists
    const [tables] = await conn.query("SHOW TABLES LIKE 'notifications'");
    if (tables.length > 0) {
      console.log('✅ Table verified: notifications exists\n');
      
      // Show table structure
      const [desc] = await conn.query('DESCRIBE notifications');
      console.log('Table structure:');
      desc.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    } else {
      console.log('❌ Table not found!');
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

createNotificationsTable();
