-- Insert default assessments into your database
-- Run this in phpMyAdmin after running the main migration

-- FIRST: Clear any existing data to avoid conflicts
DELETE FROM assessment_questions;
DELETE FROM assessments;

-- 1. PHQ-9 Depression Assessment
INSERT INTO assessments (assessment_id, name, locale, version, guidance_text, is_default, assessment_type, created_at)
VALUES (1, 'PHQ-9 Depression Screening', 'en', '1.0', 'Over the last 2 weeks, how often have you been bothered by any of the following problems?', 1, 'Depression', NOW());

INSERT INTO assessment_questions (question_id, assessment_id, question_text, response_type, position, scale_min, scale_max)
VALUES 
(1, 1, 'Little interest or pleasure in doing things', 'scale', 1, 0, 3),
(2, 1, 'Feeling down, depressed, or hopeless', 'scale', 2, 0, 3),
(3, 1, 'Trouble falling or staying asleep, or sleeping too much', 'scale', 3, 0, 3),
(4, 1, 'Feeling tired or having little energy', 'scale', 4, 0, 3),
(5, 1, 'Poor appetite or overeating', 'scale', 5, 0, 3);

-- 2. GAD-7 Anxiety Assessment
INSERT INTO assessments (assessment_id, name, locale, version, guidance_text, is_default, assessment_type, created_at)
VALUES (2, 'GAD-7 Anxiety Screening', 'en', '1.0', 'Over the last 2 weeks, how often have you been bothered by the following problems?', 1, 'Anxiety', NOW());

INSERT INTO assessment_questions (question_id, assessment_id, question_text, response_type, position, scale_min, scale_max)
VALUES 
(6, 2, 'Feeling nervous, anxious, or on edge', 'scale', 1, 0, 3),
(7, 2, 'Not being able to stop or control worrying', 'scale', 2, 0, 3),
(8, 2, 'Worrying too much about different things', 'scale', 3, 0, 3),
(9, 2, 'Trouble relaxing', 'scale', 4, 0, 3),
(10, 2, 'Being so restless that it is hard to sit still', 'scale', 5, 0, 3);

-- 3. Sleep Quality Assessment
INSERT INTO assessments (assessment_id, name, locale, version, guidance_text, is_default, assessment_type, created_at)
VALUES (3, 'Sleep Quality Assessment', 'en', '1.0', 'Please answer the following questions about your sleep patterns over the past month.', 1, 'Sleep', NOW());

INSERT INTO assessment_questions (question_id, assessment_id, question_text, response_type, position, scale_min, scale_max)
VALUES 
(11, 3, 'How would you rate your sleep quality overall?', 'scale', 1, 0, 10),
(12, 3, 'How long does it usually take you to fall asleep?', 'multiple_choice', 2, NULL, NULL),
(13, 3, 'Do you wake up during the night?', 'yes_no', 3, NULL, NULL),
(14, 3, 'How rested do you feel when you wake up?', 'scale', 4, 0, 10),
(15, 3, 'Any additional sleep concerns?', 'free_text', 5, NULL, NULL);

-- Add options for multiple choice question
UPDATE assessment_questions 
SET options = '["Less than 15 minutes","15-30 minutes","30-60 minutes","More than 1 hour"]'
WHERE question_id = 12;

-- 4. Stress Level Assessment
INSERT INTO assessments (assessment_id, name, locale, version, guidance_text, is_default, assessment_type, created_at)
VALUES (4, 'Perceived Stress Scale', 'en', '1.0', 'In the last month, how often have you felt or experienced the following?', 1, 'Stress', NOW());

INSERT INTO assessment_questions (question_id, assessment_id, question_text, response_type, position, scale_min, scale_max)
VALUES 
(16, 4, 'How often have you been upset because of something unexpected?', 'scale', 1, 0, 4),
(17, 4, 'How often have you felt unable to control important things in your life?', 'scale', 2, 0, 4),
(18, 4, 'How often have you felt nervous and stressed?', 'scale', 3, 0, 4),
(19, 4, 'How often have you felt confident about handling personal problems?', 'scale', 4, 0, 4),
(20, 4, 'How often have you felt difficulties piling up so high you could not overcome them?', 'scale', 5, 0, 4);

-- Done! You now have 4 default assessments with 20 questions total.
