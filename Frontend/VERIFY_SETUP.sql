-- QUICK VERIFICATION - Run this to check if everything is set up correctly

-- 1. Check if psychiatrists (202, 207) are assigned
SELECT 
  'Psychiatrists Assigned' as check_name,
  COUNT(*) as count,
  GROUP_CONCAT(therapist_id) as ids
FROM therapist_specialties 
WHERE specialty_id = 2 AND therapist_id IN (202, 207);

-- Expected: count = 2, ids = '202,207'

-- 2. Check their full details
SELECT 
  t.therapist_id,
  t.name,
  t.email,
  s.name as specialty,
  s.specialty_id
FROM therapists t
INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
INNER JOIN specialties s ON ts.specialty_id = s.specialty_id
WHERE t.therapist_id IN (202, 207);

-- Expected: 2 rows showing rishi and raheee as Psychiatrist

-- 3. Verify the specialties table has correct data
SELECT * FROM specialties;

-- Expected: 
-- specialty_id | name
-- 1           | Psychologist
-- 2           | Psychiatrist

-- 4. Check if API will find them
SELECT 
  t.therapist_id,
  t.name,
  t.email
FROM therapists t
INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
WHERE ts.specialty_id = 2;

-- Expected: rishi and raheee
