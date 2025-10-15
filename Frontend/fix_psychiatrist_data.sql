-- Check therapists and their specializations
SELECT 
  therapist_id,
  name,
  email,
  specialization,
  Interested_field,
  qualifications
FROM therapists
ORDER BY therapist_id;

-- Check distinct specializations
SELECT DISTINCT 
  specialization, 
  COUNT(*) as count
FROM therapists
WHERE specialization IS NOT NULL
GROUP BY specialization;

-- Check Interested_field values
SELECT DISTINCT 
  Interested_field, 
  COUNT(*) as count
FROM therapists
WHERE Interested_field IS NOT NULL
GROUP BY Interested_field;

-- Update therapists to be psychiatrists (run this if needed)
-- Replace the IDs with actual psychiatrist IDs from your database
UPDATE therapists 
SET 
  specialization = 'psychiatrist',
  Interested_field = 'Psychiatrist'
WHERE therapist_id IN (22); -- Add more IDs as needed

-- Verify the update
SELECT therapist_id, name, specialization, Interested_field
FROM therapists
WHERE specialization = 'psychiatrist' 
   OR Interested_field = 'Psychiatrist'
   OR specialization = 'Psychiatrist';
