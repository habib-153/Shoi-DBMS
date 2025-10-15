-- Referral System Database Setup
-- Run this script to set up the patient referral system

USE shoi;

-- Step 1: Add specialization to therapists table (if not exists)
ALTER TABLE therapists 
ADD COLUMN IF NOT EXISTS specialization ENUM('psychologist', 'psychiatrist', 'counselor', 'therapist') DEFAULT 'therapist';

-- Step 2: Create referrals table with psychiatrist-only constraints
CREATE TABLE IF NOT EXISTS referrals (
  referral_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT 'Patient being referred',
  referring_therapist_id INT NOT NULL COMMENT 'Psychologist making the referral',
  referred_to_therapist_id INT NULL COMMENT 'Psychiatrist receiving referral (can be null for open referrals)',
  session_id INT NULL COMMENT 'Session where referral was made',
  
  -- Referral details
  reason TEXT NOT NULL COMMENT 'Reason for psychiatric referral',
  severity_level ENUM('moderate', 'severe', 'critical') DEFAULT 'severe' COMMENT 'Urgency level',
  symptoms TEXT COMMENT 'Observed symptoms',
  current_medication TEXT COMMENT 'Current medications patient is taking',
  additional_notes TEXT COMMENT 'Any additional information',
  
  -- Status tracking
  status ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
  response_notes TEXT COMMENT 'Psychiatrist response when accepting/rejecting',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP NULL COMMENT 'When psychiatrist accepted',
  completed_at TIMESTAMP NULL COMMENT 'When treatment completed',
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (referring_therapist_id) REFERENCES therapists(therapist_id) ON DELETE CASCADE,
  FOREIGN KEY (referred_to_therapist_id) REFERENCES therapists(therapist_id) ON DELETE SET NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE SET NULL,
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_referring_therapist (referring_therapist_id),
  INDEX idx_referred_to_therapist (referred_to_therapist_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_severity (severity_level),
  
  -- Constraint: Ensure only severe conditions can be referred
  CONSTRAINT chk_severity CHECK (severity_level IN ('severe', 'critical')),
  
  -- Constraint: Referring therapist must be psychologist (enforced in application layer)
  -- Constraint: Referred-to therapist must be psychiatrist (enforced in application layer)
  CONSTRAINT chk_valid_referral CHECK (referring_therapist_id != referred_to_therapist_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2.1: Create trigger to validate psychiatrist specialization
DELIMITER $$

CREATE TRIGGER before_referral_insert
BEFORE INSERT ON referrals
FOR EACH ROW
BEGIN
  DECLARE referred_specialization VARCHAR(50);
  
  -- Check if referred_to_therapist_id is provided and is a psychiatrist
  IF NEW.referred_to_therapist_id IS NOT NULL THEN
    SELECT specialization INTO referred_specialization
    FROM therapists
    WHERE therapist_id = NEW.referred_to_therapist_id;
    
    IF referred_specialization IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Referred therapist does not exist';
    END IF;
    
    IF referred_specialization != 'psychiatrist' THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Can only refer patients to psychiatrists';
    END IF;
  END IF;
END$$

CREATE TRIGGER before_referral_update
BEFORE UPDATE ON referrals
FOR EACH ROW
BEGIN
  DECLARE referred_specialization VARCHAR(50);
  
  -- Check if referred_to_therapist_id is being updated to a psychiatrist
  IF NEW.referred_to_therapist_id IS NOT NULL THEN
    SELECT specialization INTO referred_specialization
    FROM therapists
    WHERE therapist_id = NEW.referred_to_therapist_id;
    
    IF referred_specialization IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Referred therapist does not exist';
    END IF;
    
    IF referred_specialization != 'psychiatrist' THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Can only refer patients to psychiatrists';
    END IF;
  END IF;
END$$

DELIMITER ;

-- Step 2.2: Create referral tracking/audit table
CREATE TABLE IF NOT EXISTS referral_tracking (
  tracking_id INT AUTO_INCREMENT PRIMARY KEY,
  referral_id INT NOT NULL,
  psychologist_id INT NOT NULL COMMENT 'Psychologist who made the referral',
  patient_id INT NOT NULL COMMENT 'Patient being referred',
  psychiatrist_id INT NULL COMMENT 'Psychiatrist assigned (null if open referral)',
  action VARCHAR(50) NOT NULL COMMENT 'Action taken: created, accepted, rejected, completed, cancelled',
  action_by INT NOT NULL COMMENT 'Therapist who performed the action',
  notes TEXT COMMENT 'Additional notes for this action',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (referral_id) REFERENCES referrals(referral_id) ON DELETE CASCADE,
  FOREIGN KEY (psychologist_id) REFERENCES therapists(therapist_id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (psychiatrist_id) REFERENCES therapists(therapist_id) ON DELETE SET NULL,
  FOREIGN KEY (action_by) REFERENCES therapists(therapist_id) ON DELETE CASCADE,
  
  INDEX idx_referral_id (referral_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks all actions on referrals';

-- Step 3: Create referral_comments table (for communication between therapists)
CREATE TABLE IF NOT EXISTS referral_comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  referral_id INT NOT NULL,
  therapist_id INT NOT NULL COMMENT 'Therapist making the comment',
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (referral_id) REFERENCES referrals(referral_id) ON DELETE CASCADE,
  FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id) ON DELETE CASCADE,
  
  INDEX idx_referral_id (referral_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Update some existing therapists as psychiatrists (for testing)
-- You can manually update therapists as needed
-- Example:
-- UPDATE therapists SET specialization = 'psychiatrist' WHERE therapist_id IN (1, 2, 3);
-- UPDATE therapists SET specialization = 'psychologist' WHERE therapist_id IN (202, 22);

-- Step 5: Insert sample referral data (optional, for testing)
/*
INSERT INTO referrals (
  user_id, 
  referring_therapist_id, 
  referred_to_therapist_id,
  session_id,
  reason,
  severity_level,
  symptoms,
  current_medication,
  additional_notes,
  status
) VALUES (
  1, -- user_id (replace with actual patient ID)
  202, -- referring psychologist
  NULL, -- open referral to any psychiatrist
  NULL, -- session_id
  'Patient exhibiting severe depressive symptoms with suicidal ideation requiring psychiatric evaluation',
  'severe',
  'Persistent sadness, insomnia, loss of appetite, suicidal thoughts, social withdrawal',
  'None currently',
  'Patient has no prior psychiatric history. Family history of depression. Immediate psychiatric consultation recommended.',
  'pending'
);
*/

-- Verify the setup
SELECT 'Referrals table created successfully!' as message;
SELECT COUNT(*) as referral_count FROM referrals;
SELECT COUNT(*) as comment_count FROM referral_comments;

-- Show therapists by specialization
SELECT 
  specialization,
  COUNT(*) as count
FROM therapists
GROUP BY specialization;

-- Step 6: Create view for easy referral tracking
CREATE OR REPLACE VIEW vw_referral_details AS
SELECT 
  r.referral_id,
  r.status,
  r.severity_level,
  r.reason,
  r.created_at as referral_date,
  
  -- Patient details
  u.user_id as patient_id,
  u.name as patient_name,
  u.email as patient_email,
  u.phone as patient_phone,
  
  -- Psychologist (referring) details
  tp.therapist_id as psychologist_id,
  tp.name as psychologist_name,
  tp.email as psychologist_email,
  tp.specialization as psychologist_specialization,
  
  -- Psychiatrist (referred to) details
  ts.therapist_id as psychiatrist_id,
  ts.name as psychiatrist_name,
  ts.email as psychiatrist_email,
  ts.specialization as psychiatrist_specialization,
  
  -- Referral metadata
  r.symptoms,
  r.current_medication,
  r.additional_notes,
  r.response_notes,
  r.accepted_at,
  r.completed_at,
  
  -- Session details
  r.session_id,
  s.session_date
FROM referrals r
INNER JOIN users u ON r.user_id = u.user_id
INNER JOIN therapists tp ON r.referring_therapist_id = tp.therapist_id
LEFT JOIN therapists ts ON r.referred_to_therapist_id = ts.therapist_id
LEFT JOIN sessions s ON r.session_id = s.session_id;

-- Step 7: Query examples for verification
-- Example 1: Get all referrals from a specific psychologist
-- SELECT * FROM vw_referral_details WHERE psychologist_id = 202;

-- Example 2: Get all referrals to a specific psychiatrist
-- SELECT * FROM vw_referral_details WHERE psychiatrist_id = 1;

-- Example 3: Get all severe/critical referrals
-- SELECT * FROM vw_referral_details WHERE severity_level IN ('severe', 'critical');

-- Example 4: Get referral tracking history
-- SELECT rt.*, t.name as action_by_name FROM referral_tracking rt
-- INNER JOIN therapists t ON rt.action_by = t.therapist_id
-- WHERE referral_id = 1 ORDER BY created_at DESC;
