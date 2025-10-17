-- Clear all assessment data to start fresh
-- Run this in phpMyAdmin or MySQL Workbench

-- Delete in correct order (children first, then parents)
DELETE FROM assessment_responses;
DELETE FROM assessment_assignments;
DELETE FROM assessment_questions;
DELETE FROM assessments;

-- Now you can create new assessments and they'll start from ID 1
