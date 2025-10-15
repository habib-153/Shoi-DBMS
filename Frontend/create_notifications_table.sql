-- শুধু এই SQL টা রান করুন
-- Just run this ONE SQL file

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

-- Verify
SELECT 'Table created successfully!' as result;
DESCRIBE notifications;
