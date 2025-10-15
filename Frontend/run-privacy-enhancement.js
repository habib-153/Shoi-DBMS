const mysql = require('mysql2/promise');
const fs = require('fs');

async function enhancePrivacySettings() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'shoi',
      multipleStatements: true
    });
    
    console.log('✓ Connected to database\n');
    console.log('🔧 Enhancing privacy settings table...\n');
    
    // Read and execute SQL file
    const sql = fs.readFileSync('enhance_privacy_settings.sql', 'utf8');
    
    // Split by semicolon and filter out comments and empty queries
    const queries = sql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--') && !q.startsWith('/*'));
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const query of queries) {
      try {
        if (query.includes('SELECT') && query.includes(' as \'\'')) {
          // Skip display messages
          continue;
        }
        
        await connection.execute(query);
        successCount++;
        
        if (query.includes('ALTER TABLE')) {
          console.log('  ✓ Added new privacy columns');
        } else if (query.includes('CREATE TABLE')) {
          const match = query.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/);
          if (match) console.log(`  ✓ Created table: ${match[1]}`);
        } else if (query.includes('CREATE INDEX')) {
          console.log('  ✓ Created index');
        } else if (query.includes('UPDATE')) {
          console.log('  ✓ Updated existing records');
        }
      } catch (err) {
        if (err.message.includes('Duplicate column') || 
            err.message.includes('already exists')) {
          skipCount++;
        } else {
          console.error(`  ⚠️  Warning: ${err.message.substring(0, 80)}`);
        }
      }
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Enhancement Complete!`);
    console.log(`   Queries executed: ${successCount}`);
    if (skipCount > 0) console.log(`   Skipped (already exists): ${skipCount}`);
    console.log('═══════════════════════════════════════════\n');
    
    // Verify changes
    console.log('📊 Verification:\n');
    
    const [columns] = await connection.execute('DESCRIBE privacy_settings');
    console.log(`  Total columns: ${columns.length}`);
    
    const [settings] = await connection.execute(
      'SELECT COUNT(*) as total FROM privacy_settings'
    );
    console.log(`  Total privacy settings: ${settings[0].total}`);
    
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE '%privacy%' OR SHOW TABLES LIKE '%blocked%' OR SHOW TABLES LIKE '%trusted%'
    `);
    
    console.log('\n📋 Privacy-related tables:');
    const [allTables] = await connection.execute('SHOW TABLES');
    const privacyTables = allTables.filter(t => {
      const tableName = Object.values(t)[0].toLowerCase();
      return tableName.includes('privacy') || tableName.includes('blocked') || tableName.includes('trusted');
    });
    privacyTables.forEach(t => console.log(`    - ${Object.values(t)[0]}`));
    
    console.log('\n✨ New Features Added:');
    console.log('   • Profile visibility controls');
    console.log('   • Activity history settings');
    console.log('   • Communication preferences');
    console.log('   • Notification management');
    console.log('   • Data sharing controls');
    console.log('   • Security features (2FA, login alerts)');
    console.log('   • Privacy zones (incognito, ghost mode)');
    console.log('   • Advanced features (screenshot blocking, auto-delete)');
    console.log('   • Blocked users management');
    console.log('   • Trusted contacts system');
    console.log('   • Privacy activity logging');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Database connection closed');
    }
  }
}

enhancePrivacySettings();
