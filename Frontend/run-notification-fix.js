const mysql = require('mysql2/promise');

async function addPatientNotifications() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'shoi'
    });
    
    console.log('✓ Connected to database');
    console.log('');
    
    // Check existing notifications
    console.log('📊 Checking current notifications...');
    const [existingNotifs] = await connection.execute(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE recipient_type = 'user' AND notification_type = 'referral'`
    );
    console.log(`   Found ${existingNotifs[0].count} existing patient referral notifications`);
    console.log('');
    
    // Check all referrals
    console.log('📋 Checking referrals...');
    const [referrals] = await connection.execute(
      `SELECT COUNT(*) as count FROM referrals`
    );
    console.log(`   Found ${referrals[0].count} total referrals`);
    console.log('');
    
    // Add patient notifications for all existing referrals
    console.log('🔔 Adding patient notifications...');
    const [result] = await connection.execute(`
      INSERT INTO notifications 
        (recipient_type, recipient_id, sender_type, sender_id, notification_type, 
         title, message, related_id, action_url, created_at, is_read)
      SELECT 
        'user' as recipient_type,
        r.user_id as recipient_id,
        'therapist' as sender_type,
        r.referring_therapist_id as sender_id,
        'referral' as notification_type,
        'You Have Been Referred to a Psychiatrist' as title,
        CONCAT('Your psychologist Dr. ', rt.name, ' has referred you to Dr. ', pt.name, 
               ' for specialized psychiatric care. You can view the referral details and contact information in your Session Notes.') as message,
        r.referral_id as related_id,
        '/session-notes' as action_url,
        r.created_at as created_at,
        0 as is_read
      FROM referrals r
      JOIN therapists rt ON r.referring_therapist_id = rt.therapist_id
      JOIN therapists pt ON r.referred_to_therapist_id = pt.therapist_id
      WHERE NOT EXISTS (
        SELECT 1 FROM notifications n 
        WHERE n.recipient_type = 'user' 
        AND n.recipient_id = r.user_id 
        AND n.related_id = r.referral_id 
        AND n.notification_type = 'referral'
      )
    `);
    
    console.log(`   ✓ Added ${result.affectedRows} new patient notifications!`);
    console.log('');
    
    // Verify for patient 678
    console.log('👤 Checking notifications for patient 678...');
    const [patient678Notifs] = await connection.execute(
      `SELECT 
        notification_id, 
        title,
        LEFT(message, 80) as message_preview,
        is_read,
        created_at
      FROM notifications 
      WHERE recipient_type = 'user' 
      AND recipient_id = 678
      AND notification_type = 'referral'
      ORDER BY created_at DESC`
    );
    
    if (patient678Notifs.length > 0) {
      console.log(`   ✓ Found ${patient678Notifs.length} referral notification(s):`);
      patient678Notifs.forEach((notif, i) => {
        console.log(`      ${i + 1}. ${notif.title}`);
        console.log(`         Created: ${notif.created_at}`);
        console.log(`         Read: ${notif.is_read ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('   ⚠ No notifications found for patient 678');
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('✅ DONE! Notifications added successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Go to http://localhost:3000');
    console.log('  2. Login as patient (user 678)');
    console.log('  3. Press Ctrl+Shift+R (hard refresh)');
    console.log('  4. Click the bell icon 🔔');
    console.log('  5. You will see the referral notification!');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✓ Database connection closed');
    }
  }
}

addPatientNotifications();
