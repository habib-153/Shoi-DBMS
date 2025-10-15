-- =============================================
-- SIMPLE SETUP - Works with your actual table structure
-- =============================================
-- Your therapists table has: Interested_field (NOT specialization)
-- =============================================

-- Step 1: Check current therapists
SELECT '=== Current Therapists ===' as info;
SELECT 
  therapist_id,
  name,
  email,
  Interested_field,
  years_experience,
  fees_min,
  fees_max
FROM therapists;

-- Step 2: Update therapists to be psychiatrists
-- REPLACE the therapist_ids below with actual IDs from the list above
UPDATE therapists 
SET Interested_field = 'Psychiatrist'
WHERE therapist_id IN (22);  -- ⬅️ CHANGE THIS TO YOUR PSYCHIATRIST IDs

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' therapists') as result;

-- Step 3: Verify psychiatrists
SELECT '=== Psychiatrists Found ===' as info;
SELECT 
  therapist_id,
  name,
  email,
  Interested_field,
  years_experience,
  fees_min,
  fees_max
FROM therapists
WHERE Interested_field LIKE '%Psychiatr%';

-- Step 4: Create notifications table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ Notifications table created!' as result;

-- Step 5: Final verification
SELECT '=== SETUP COMPLETE ===' as info;
SELECT CONCAT('Psychiatrists: ', COUNT(*)) as count
FROM therapists
WHERE Interested_field LIKE '%Psychiatr%';

SELECT 'Notifications table: ' as info, 
       IF(COUNT(*) > 0, '✅ EXISTS', '❌ MISSING') as status
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
  AND table_name = 'notifications';
