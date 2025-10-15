-- Simple Migration: Add specialization column to therapists table
-- Copy and paste this directly into your MySQL Workbench or command line

USE shoi;

-- Add the specialization column
ALTER TABLE therapists 
ADD COLUMN specialization ENUM('psychologist', 'psychiatrist', 'counselor', 'therapist') 
DEFAULT 'therapist';

-- Update existing therapists to have default value
UPDATE therapists 
SET specialization = 'therapist' 
WHERE specialization IS NULL;

-- Verify it worked
SELECT 'Column added successfully!' AS status;
DESCRIBE therapists;
