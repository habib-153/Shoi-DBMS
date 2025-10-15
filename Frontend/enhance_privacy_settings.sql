-- ============================================================
-- ENHANCED PRIVACY SETTINGS SYSTEM
-- Comprehensive privacy and security features
-- ============================================================

USE shoi;

-- Step 1: Backup existing data
CREATE TABLE IF NOT EXISTS privacy_settings_backup AS SELECT * FROM privacy_settings;

-- Step 2: Add new columns to existing table
ALTER TABLE privacy_settings
  -- Profile Visibility
  ADD COLUMN IF NOT EXISTS profile_visibility ENUM('public', 'private', 'connections_only') DEFAULT 'public' AFTER stealth_icon,
  ADD COLUMN IF NOT EXISTS show_profile_picture BOOLEAN DEFAULT TRUE AFTER profile_visibility,
  ADD COLUMN IF NOT EXISTS show_real_name BOOLEAN DEFAULT TRUE AFTER show_profile_picture,
  ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT FALSE AFTER show_real_name,
  ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT FALSE AFTER show_email,
  
  -- Activity & History
  ADD COLUMN IF NOT EXISTS show_last_active BOOLEAN DEFAULT TRUE AFTER show_phone,
  ADD COLUMN IF NOT EXISTS show_appointment_history BOOLEAN DEFAULT FALSE AFTER show_last_active,
  ADD COLUMN IF NOT EXISTS show_session_count BOOLEAN DEFAULT FALSE AFTER show_appointment_history,
  ADD COLUMN IF NOT EXISTS allow_therapist_reviews BOOLEAN DEFAULT TRUE AFTER show_session_count,
  
  -- Communication Preferences  
  ADD COLUMN IF NOT EXISTS allow_messages BOOLEAN DEFAULT TRUE AFTER allow_therapist_reviews,
  ADD COLUMN IF NOT EXISTS allow_referrals BOOLEAN DEFAULT TRUE AFTER allow_messages,
  ADD COLUMN IF NOT EXISTS allow_family_connections BOOLEAN DEFAULT TRUE AFTER allow_referrals,
  
  -- Notification Settings
  ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE AFTER allow_family_connections,
  ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT FALSE AFTER email_notifications,
  ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT TRUE AFTER sms_notifications,
  ADD COLUMN IF NOT EXISTS appointment_reminders BOOLEAN DEFAULT TRUE AFTER push_notifications,
  ADD COLUMN IF NOT EXISTS session_notes_alerts BOOLEAN DEFAULT TRUE AFTER appointment_reminders,
  ADD COLUMN IF NOT EXISTS referral_alerts BOOLEAN DEFAULT TRUE AFTER session_notes_alerts,
  ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT FALSE AFTER referral_alerts,
  
  -- Data & Security
  ADD COLUMN IF NOT EXISTS share_anonymous_data BOOLEAN DEFAULT FALSE AFTER share_data_with_therapist,
  ADD COLUMN IF NOT EXISTS allow_data_export BOOLEAN DEFAULT TRUE AFTER share_anonymous_data,
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE AFTER allow_data_export,
  ADD COLUMN IF NOT EXISTS login_alerts BOOLEAN DEFAULT TRUE AFTER two_factor_enabled,
  ADD COLUMN IF NOT EXISTS session_timeout_minutes INT DEFAULT 30 AFTER login_alerts,
  
  -- Privacy Zones (Unique Feature)
  ADD COLUMN IF NOT EXISTS incognito_mode BOOLEAN DEFAULT FALSE AFTER session_timeout_minutes,
  ADD COLUMN IF NOT EXISTS anonymous_browsing BOOLEAN DEFAULT FALSE AFTER incognito_mode,
  ADD COLUMN IF NOT EXISTS hide_from_search BOOLEAN DEFAULT FALSE AFTER anonymous_browsing,
  ADD COLUMN IF NOT EXISTS ghost_mode_until DATETIME NULL AFTER hide_from_search,
  
  -- Advanced Features
  ADD COLUMN IF NOT EXISTS block_screenshots BOOLEAN DEFAULT FALSE AFTER ghost_mode_until,
  ADD COLUMN IF NOT EXISTS auto_delete_messages_days INT DEFAULT NULL AFTER block_screenshots,
  ADD COLUMN IF NOT EXISTS require_password_for_notes BOOLEAN DEFAULT FALSE AFTER auto_delete_messages_days,
  
  -- Timestamps
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER require_password_for_notes,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Step 3: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_privacy ON privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_visibility ON privacy_settings(profile_visibility);
CREATE INDEX IF NOT EXISTS idx_shield_mode ON privacy_settings(shield_mode);
CREATE INDEX IF NOT EXISTS idx_incognito ON privacy_settings(incognito_mode);

-- Step 4: Set defaults for existing users
UPDATE privacy_settings 
SET 
  profile_visibility = 'public',
  show_profile_picture = TRUE,
  show_real_name = TRUE,
  allow_messages = TRUE,
  email_notifications = TRUE,
  push_notifications = TRUE
WHERE profile_visibility IS NULL;

-- Step 5: Create privacy activity log table
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
);

-- Step 6: Create blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
  block_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  blocked_user_id INT NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_block (user_id, blocked_user_id)
);

-- Step 7: Create trusted contacts table
CREATE TABLE IF NOT EXISTS trusted_contacts (
  trust_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  trusted_user_id INT NOT NULL,
  trust_level ENUM('view_profile', 'view_appointments', 'emergency_contact') DEFAULT 'view_profile',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (trusted_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_trust (user_id, trusted_user_id)
);

-- Step 8: Summary
SELECT '✅ Privacy Settings Enhanced Successfully!' as '';
SELECT CONCAT('Total privacy settings: ', COUNT(*)) as '' FROM privacy_settings;
SELECT 'New tables created:' as '';
SELECT '  - privacy_activity_log' as '';
SELECT '  - blocked_users' as '';
SELECT '  - trusted_contacts' as '';
SELECT '🎉 Privacy system is now ready!' as '';
