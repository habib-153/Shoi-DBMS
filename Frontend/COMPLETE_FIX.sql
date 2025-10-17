-- COMPLETE FIX FOR ASSESSMENT SYSTEM
-- Run this entire script in phpMyAdmin SQL tab
-- Database: shoi

-- 1. Fix all existing assessments to belong to therapist 212
UPDATE assessments 
SET created_by_therapist_id = 212, 
    is_default = 0
WHERE created_by_therapist_id IS NULL OR created_by_therapist_id != 212;

-- 2. Verify the fix - you should see all 3 assessments with therapist_id = 212
SELECT 
  assessment_id, 
  name, 
  created_by_therapist_id, 
  is_default, 
  assessment_type,
  created_at
FROM assessments 
ORDER BY assessment_id;

-- 3. Check questions are linked correctly
SELECT 
  q.question_id,
  q.assessment_id,
  a.name as assessment_name,
  q.question_text,
  q.response_type
FROM assessment_questions q
LEFT JOIN assessments a ON q.assessment_id = a.assessment_id
ORDER BY q.assessment_id, q.question_id;

-- DONE! After running this:
-- 1. Refresh your browser at /therapist/assessments
-- 2. You should see all 3 assessments
-- 3. You should be able to assign them to patients
