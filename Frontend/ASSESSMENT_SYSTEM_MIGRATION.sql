-- Assessment System Enhancement Migration
-- This script adds necessary columns and tables for the interactive assessment system

-- 1. Alter assessments table to add new columns
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS created_by_therapist_id INT NULL,
ADD COLUMN IF NOT EXISTS is_default TINYINT(1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS assessment_type VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Alter assessment_questions to add options field for multiple choice
ALTER TABLE assessment_questions 
ADD COLUMN IF NOT EXISTS options TEXT NULL COMMENT 'JSON array of options for multiple choice questions';

-- 3. Create assessment_assignments table (tracks which assessments are assigned to which patients)
CREATE TABLE IF NOT EXISTS assessment_assignments (
  assignment_id INT PRIMARY KEY,
  assessment_id INT NOT NULL,
  user_id INT NOT NULL,
  assigned_by_therapist_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NULL,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  completed_at TIMESTAMP NULL,
  score INT NULL,
  notes TEXT NULL,
  FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by_therapist_id) REFERENCES therapists(therapist_id) ON DELETE CASCADE,
  INDEX idx_user_assignments (user_id, status),
  INDEX idx_therapist_assignments (assigned_by_therapist_id)
);

-- 4. Modify assessment_responses table to link with assignments
ALTER TABLE assessment_responses
  ADD COLUMN assignment_id INT,
  ADD CONSTRAINT fk_responses_assignment FOREIGN KEY (assignment_id) REFERENCES assessment_assignments(assignment_id) ON DELETE CASCADE;

-- 5. Create response_answers table to store individual question answers
CREATE TABLE IF NOT EXISTS response_answers (
  response_answer_id INT PRIMARY KEY,
  response_id INT NOT NULL,
  question_id INT NOT NULL,
  answer_value INT,
  free_text TEXT,
  CONSTRAINT fk_answer_response FOREIGN KEY (response_id) REFERENCES assessment_responses(response_id) ON DELETE CASCADE,
  CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES assessment_questions(question_id) ON DELETE CASCADE
);-- 5. Insert default assessment templates
INSERT INTO assessments (assessment_id, name, locale, version, guidance_text, is_default, assessment_type, created_at)
VALUES 
  (1, 'Depression Screening (PHQ-9)', 'en', '1.0', 'This questionnaire helps assess symptoms of depression over the past two weeks.', 1, 'Depression', NOW()),
  (2, 'Anxiety Screening (GAD-7)', 'en', '1.0', 'This brief questionnaire measures the severity of generalized anxiety symptoms.', 1, 'Anxiety', NOW()),
  (3, 'Sleep Quality Assessment', 'en', '1.0', 'Evaluate your sleep patterns and quality over the past month.', 1, 'Sleep', NOW()),
  (4, 'Stress Level Assessment', 'en', '1.0', 'Identify your current stress levels and coping mechanisms.', 1, 'Stress', NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 6. Insert sample questions for Depression Screening (PHQ-9)
INSERT INTO assessment_questions (question_id, assessment_id, question_text, response_type, position, options)
VALUES 
  (1, 1, 'Little interest or pleasure in doing things', 'scale', 1, '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'),
  (2, 1, 'Feeling down, depressed, or hopeless', 'scale', 2, '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'),
  (3, 1, 'Trouble falling or staying asleep, or sleeping too much', 'scale', 3, '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'),
  (4, 1, 'Feeling tired or having little energy', 'scale', 4, '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'),
  (5, 1, 'Poor appetite or overeating', 'scale', 5, '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]')
ON DUPLICATE KEY UPDATE question_text = VALUES(question_text);

-- 7. Insert sample questions for Anxiety Screening (GAD-7)
INSERT INTO assessment_questions (question_id, assessment_id, question_text, response_type, position, options)
VALUES 
  (6, 2, 'Feeling nervous, anxious, or on edge', 'scale', 1, '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'),
  (7, 2, 'Not being able to stop or control worrying', 'scale', 2, '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'),
  (8, 2, 'Worrying too much about different things', 'scale', 3, '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'),
  (9, 2, 'Trouble relaxing', 'scale', 4, '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'),
  (10, 2, 'Feeling afraid as if something awful might happen', 'scale', 5, '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]')
ON DUPLICATE KEY UPDATE question_text = VALUES(question_text);

-- 8. Insert sample questions for Sleep Quality
INSERT INTO assessment_questions (question_id, assessment_id, question_text, response_type, position, options)
VALUES 
  (11, 3, 'How would you rate your sleep quality overall?', 'scale', 1, '["0 - Very poor", "1 - Poor", "2 - Fair", "3 - Good", "4 - Very good"]'),
  (12, 3, 'How long does it usually take you to fall asleep?', 'multiple_choice', 2, '["Less than 15 minutes", "15-30 minutes", "30-60 minutes", "More than 60 minutes"]'),
  (13, 3, 'How many hours of actual sleep do you get at night?', 'text', 3, NULL),
  (14, 3, 'How often do you wake up during the night?', 'scale', 4, '["0 - Never", "1 - Rarely", "2 - Sometimes", "3 - Often", "4 - Always"]')
ON DUPLICATE KEY UPDATE question_text = VALUES(question_text);

-- 9. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_type ON assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessment_default ON assessments(is_default);
CREATE INDEX IF NOT EXISTS idx_question_assessment ON assessment_questions(assessment_id, position);
CREATE INDEX IF NOT EXISTS idx_response_user ON assessment_responses(user_id, assessment_id);

COMMIT;
