-- Fix existing assessments to show up for therapist 212
-- Run this in phpMyAdmin SQL tab

UPDATE assessments 
SET created_by_therapist_id = 212 
WHERE assessment_id IN (2, 3);

-- Verify the fix
SELECT assessment_id, name, created_by_therapist_id, is_default, assessment_type 
FROM assessments 
ORDER BY assessment_id;
