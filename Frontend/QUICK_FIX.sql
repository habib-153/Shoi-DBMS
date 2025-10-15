-- =============================================
-- QUICK FIX: Add Psychiatrists
-- =============================================
-- This will mark specific therapists as psychiatrists
-- =============================================

-- Update therapist ID 22 (Fayaz Noman) to be a psychiatrist
UPDATE therapists 
SET Interested_field = 'Psychiatrist'
WHERE therapist_id = 22;

-- You can add more by uncommenting and modifying these lines:
-- UPDATE therapists SET Interested_field = 'Psychiatrist' WHERE therapist_id = 23;
-- UPDATE therapists SET Interested_field = 'Psychiatrist' WHERE therapist_id = 24;
-- UPDATE therapists SET Interested_field = 'Psychiatrist' WHERE therapist_id = 25;

-- Verify the update
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

-- Create notifications table if it doesn't exist
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

-- Show success message
SELECT '✅ SETUP COMPLETE!' as status;
SELECT 'Psychiatrists marked:' as info, COUNT(*) as count 
FROM therapists 
WHERE Interested_field LIKE '%Psychiatr%';
