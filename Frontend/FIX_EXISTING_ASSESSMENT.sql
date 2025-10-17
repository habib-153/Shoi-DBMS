-- Fix existing assessment data so it shows up
-- Run this in phpMyAdmin or MySQL Workbench

-- First, make sure the columns exist (run the migration if you haven't)
-- Then update the existing assessment to have required fields

UPDATE assessments 
SET 
  is_default = 0,
  assessment_type = COALESCE(assessment_type, 'Custom'),
  created_by_therapist_id = 212,  -- Your therapist ID
  created_at = COALESCE(created_at, NOW())
WHERE assessment_id = 1;

-- Check what you have now
SELECT * FROM assessments;
SELECT * FROM assessment_questions WHERE assessment_id = 1;
