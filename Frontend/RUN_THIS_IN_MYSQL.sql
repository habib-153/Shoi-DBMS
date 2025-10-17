-- Run this in your MySQL client (phpMyAdmin, MySQL Workbench, or any DB tool)
-- Database: shoi

-- 1. Modify assessments table (only add new columns, keep existing data)
-- Run each ALTER separately if you get errors
ALTER TABLE assessments ADD COLUMN created_by_therapist_id INT;
ALTER TABLE assessments ADD COLUMN is_default TINYINT(1) DEFAULT 0;
ALTER TABLE assessments ADD COLUMN assessment_type VARCHAR(50) DEFAULT 'General';
ALTER TABLE assessments ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- 2. Mark existing assessments as defaults (so they show up)
UPDATE assessments 
SET is_default = 1, 
    assessment_type = COALESCE(assessment_type, 'General'),
    created_at = COALESCE(created_at, NOW())
WHERE is_default IS NULL OR is_default = 0 OR is_default = '';

-- 3. Modify assessment_questions table (keep existing data)
ALTER TABLE assessment_questions ADD COLUMN options TEXT;
ALTER TABLE assessment_questions ADD COLUMN scale_min INT;
ALTER TABLE assessment_questions ADD COLUMN scale_max INT;

-- 4. Modify assessment_responses table to store individual answers
ALTER TABLE assessment_responses ADD COLUMN assignment_id INT;
ALTER TABLE assessment_responses ADD COLUMN question_id INT;
ALTER TABLE assessment_responses ADD COLUMN response_value INT;
ALTER TABLE assessment_responses ADD COLUMN response_text TEXT;

-- 5. Create assessment_assignments table
CREATE TABLE IF NOT EXISTS assessment_assignments (
  assignment_id INT PRIMARY KEY,
  assessment_id INT NOT NULL,
  user_id INT NOT NULL,
  assigned_by_therapist_id INT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date DATE,
  status ENUM('pending', 'completed') DEFAULT 'pending',
  completed_at DATETIME,
  score INT,
  notes TEXT,
  CONSTRAINT fk_aa_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id) ON DELETE CASCADE,
  CONSTRAINT fk_aa_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_aa_therapist FOREIGN KEY (assigned_by_therapist_id) REFERENCES therapists(therapist_id) ON DELETE CASCADE
);

-- Done! Tables are ready.

