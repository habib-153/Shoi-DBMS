-- DIAGNOSTIC: Check what IDs exist in your database
-- Run this in phpMyAdmin to see what's causing conflicts

-- Check assessments
SELECT 'ASSESSMENTS:' as info;
SELECT assessment_id, name, created_by_therapist_id, is_default FROM assessments ORDER BY assessment_id;

-- Check questions
SELECT 'QUESTIONS:' as info;
SELECT question_id, assessment_id, question_text, response_type FROM assessment_questions ORDER BY question_id;

-- Check what the next IDs should be
SELECT 'NEXT IDS:' as info;
SELECT 
  (SELECT IFNULL(MAX(assessment_id), 0) + 1 FROM assessments) as next_assessment_id,
  (SELECT IFNULL(MAX(question_id), 0) + 1 FROM assessment_questions) as next_question_id;
