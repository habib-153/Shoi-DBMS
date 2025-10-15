-- =============================================
-- NOTIFICATIONS SYSTEM DATABASE SETUP
-- =============================================

-- Create notifications table
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

-- Create notification preferences table (optional, for future use)
CREATE TABLE IF NOT EXISTS notification_preferences (
  preference_id INT AUTO_INCREMENT PRIMARY KEY,
  user_type ENUM('user', 'therapist') NOT NULL,
  user_id INT NOT NULL,
  notification_type ENUM('referral', 'appointment', 'message', 'session_note', 'system') NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_type (user_type, user_id, notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SAMPLE QUERIES
-- =============================================

-- Get unread notifications for a therapist
-- SELECT * FROM notifications 
-- WHERE recipient_type = 'therapist' 
--   AND recipient_id = ? 
--   AND is_read = FALSE 
-- ORDER BY created_at DESC;

-- Mark notification as read
-- UPDATE notifications 
-- SET is_read = TRUE, read_at = NOW() 
-- WHERE notification_id = ?;

-- Mark all notifications as read for a user
-- UPDATE notifications 
-- SET is_read = TRUE, read_at = NOW() 
-- WHERE recipient_type = ? 
--   AND recipient_id = ? 
--   AND is_read = FALSE;

-- Get notification count
-- SELECT COUNT(*) as unread_count 
-- FROM notifications 
-- WHERE recipient_type = ? 
--   AND recipient_id = ? 
--   AND is_read = FALSE;

-- Delete old read notifications (cleanup)
-- DELETE FROM notifications 
-- WHERE is_read = TRUE 
--   AND read_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
