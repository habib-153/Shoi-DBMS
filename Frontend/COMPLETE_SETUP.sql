-- =============================================
-- COMPLETE SETUP SCRIPT
-- Run this entire file in your MySQL console
-- =============================================

-- =============================================
-- STEP 1: CREATE NOTIFICATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_type ENUM('user', 'therapist') NOT NULL,
  recipient_id INT NOT NULL,
  sender_type ENUM('user', 'therapist', 'system') DEFAULT 'system',
  sender_id INT NULL,
  notification_type ENUM('referral', 'appointment', 'message', 'session_note', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_id INT NULL COMMENT 'ID of related entity (referral_id, appointment_id, etc)',
  action_url VARCHAR(500) NULL COMMENT 'URL to navigate when notification is clicked',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  
  INDEX idx_recipient (recipient_type, recipient_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at),
  INDEX idx_notification_type (notification_type),
  INDEX idx_related_id (related_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✅ Notifications table created!' as status;

-- =============================================
-- STEP 2: CHECK CURRENT THERAPIST DATA
-- =============================================

SELECT 'Current therapist data:' as info;
SELECT 
  therapist_id,
  name,
  email,
  specialization,
  Interested_field,
  qualifications
FROM therapists
ORDER BY therapist_id;

-- =============================================
-- STEP 3: CHECK SPECIALIZATIONS
-- =============================================

SELECT 'Current specialization breakdown:' as info;
SELECT DISTINCT 
  COALESCE(specialization, 'NULL') as specialization,
  COALESCE(Interested_field, 'NULL') as interested_field,
  COUNT(*) as count
FROM therapists
GROUP BY specialization, Interested_field;

-- =============================================
-- STEP 4: UPDATE THERAPISTS TO BE PSYCHIATRISTS
-- =============================================
-- IMPORTANT: Review the list above and modify the WHERE clause
-- to include the correct therapist_ids that should be psychiatrists

-- Option A: Update by specific IDs
UPDATE therapists 
SET 
  specialization = 'psychiatrist',
  Interested_field = 'Psychiatrist'
WHERE therapist_id IN (22, 23, 24, 25, 26); 
-- ⬆️ REPLACE THESE IDs WITH YOUR ACTUAL PSYCHIATRIST IDs

-- Option B: If no one has been marked yet, you can update by qualifications
-- Uncomment the line below if you want to use this approach
-- UPDATE therapists SET specialization = 'psychiatrist', Interested_field = 'Psychiatrist' WHERE qualifications LIKE '%MD%' OR qualifications LIKE '%Psychiatry%';

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' therapists to psychiatrists') as status;

-- =============================================
-- STEP 5: VERIFY PSYCHIATRISTS EXIST
-- =============================================

SELECT 'Psychiatrists in database:' as info;
SELECT 
  therapist_id,
  name,
  email,
  specialization,
  Interested_field,
  qualifications,
  years_experience,
  fees_min,
  fees_max
FROM therapists
WHERE specialization = 'psychiatrist' 
   OR Interested_field = 'Psychiatrist'
   OR specialization = 'Psychiatrist';

-- =============================================
-- STEP 6: CREATE TEST PSYCHIATRIST (IF NEEDED)
-- =============================================
-- If the query above returned 0 rows, uncomment and run this:

/*
INSERT INTO therapists (
  name, 
  email, 
  phone,
  password_hash,
  specialization,
  Interested_field,
  qualifications,
  years_experience,
  educational_info,
  fees_min,
  fees_max,
  rating,
  created_at
) VALUES (
  'Dr. Sarah Johnson',
  'sarah.psychiatrist@example.com',
  '+1234567890',
  '$2b$10$rKz5JxGHHWqJ7YQKqY8WPuJGPZ4L7YE6RzLfKvXQZ2QZ2QZ2QZ2QZ2',
  'psychiatrist',
  'Psychiatrist',
  'MD, Board Certified Psychiatrist',
  10,
  'Harvard Medical School, MD in Psychiatry',
  150,
  250,
  4.8,
  NOW()
);

SELECT '✅ Test psychiatrist created!' as status;
*/

-- =============================================
-- STEP 7: VERIFY NOTIFICATIONS TABLE
-- =============================================

SELECT 'Notifications table structure:' as info;
DESCRIBE notifications;

-- =============================================
-- STEP 8: CREATE TEST NOTIFICATION (OPTIONAL)
-- =============================================
-- This is optional - just to test the table works
-- Replace the IDs with actual values from your database

/*
INSERT INTO notifications (
  recipient_type,
  recipient_id,
  sender_type,
  sender_id,
  notification_type,
  title,
  message,
  action_url,
  created_at
) VALUES (
  'therapist',
  22,  -- Replace with actual psychiatrist ID
  'system',
  NULL,
  'system',
  'Welcome to Notifications!',
  'This is a test notification to verify the system is working.',
  '/therapist/dashboard',
  NOW()
);

SELECT '✅ Test notification created!' as status;
*/

-- =============================================
-- STEP 9: FINAL VERIFICATION
-- =============================================

SELECT '===========================================' as '';
SELECT '✅ SETUP COMPLETE!' as '';
SELECT '===========================================' as '';
SELECT '' as '';

-- Check 1: Notifications table
SELECT CONCAT('✅ Notifications table exists: ', 
  IF(COUNT(*) > 0, 'YES', 'NO')) as check_1
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
  AND table_name = 'notifications';

-- Check 2: Psychiatrists exist
SELECT CONCAT('✅ Psychiatrists found: ', COUNT(*)) as check_2
FROM therapists
WHERE specialization = 'psychiatrist' 
   OR Interested_field = 'Psychiatrist';

-- Check 3: Show psychiatrist details
SELECT 'Psychiatrists available for referrals:' as info;
SELECT 
  therapist_id,
  name,
  email,
  COALESCE(specialization, Interested_field) as type
FROM therapists
WHERE specialization = 'psychiatrist' 
   OR Interested_field = 'Psychiatrist'
   OR specialization = 'Psychiatrist';

SELECT '' as '';
SELECT '===========================================' as '';
SELECT 'NEXT STEPS:' as '';
SELECT '===========================================' as '';
SELECT '1. Visit: http://localhost:3000/api/debug-psychiatrists' as step;
SELECT '2. Visit: http://localhost:3000/api/psychiatrists' as step;
SELECT '3. Login as psychologist and go to /therapist/sessions' as step;
SELECT '4. Try creating a referral - dropdown should show psychiatrists!' as step;
SELECT '5. Login as psychiatrist to see notification bell' as step;
SELECT '===========================================' as '';
