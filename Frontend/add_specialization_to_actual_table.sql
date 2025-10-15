-- Add specialization column to your ACTUAL therapists table
-- Your table structure is different from the documentation

USE shoi;

-- Add specialization column after gender column
ALTER TABLE therapists 
ADD COLUMN specialization ENUM('psychologist', 'psychiatrist', 'counselor', 'therapist') 
DEFAULT 'therapist'
AFTER gender;

-- Update existing therapists based on license_no
UPDATE therapists 
SET specialization = CASE 
  WHEN license_no IS NOT NULL AND license_no != '' THEN 'psychiatrist'
  WHEN educational_info IS NOT NULL THEN 'psychologist'
  ELSE 'therapist'
END
WHERE specialization IS NULL OR specialization = 'therapist';

-- Verify
SELECT therapist_id, name, license_no, educational_info, specialization 
FROM therapists 
LIMIT 10;

SELECT 'Specialization column added successfully!' AS status;
