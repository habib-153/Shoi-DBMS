-- MANUAL SPECIALTY ASSIGNMENT
-- Use this if you want to manually assign specialties to specific therapists

-- First, check current state
SELECT 
  t.therapist_id,
  t.name,
  t.email,
  t.license_no,
  t.Interested_field,
  GROUP_CONCAT(ts.specialty_id) as current_specialties
FROM therapists t
LEFT JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
GROUP BY t.therapist_id, t.name, t.email, t.license_no, t.Interested_field
ORDER BY t.therapist_id;

-- ============================================
-- MANUAL ASSIGNMENT EXAMPLES
-- ============================================

-- Example 1: Make therapist 200 (Saif Sarkar) a Psychiatrist
-- First delete existing specialty if any
DELETE FROM therapist_specialties WHERE therapist_id = 200;
-- Then insert Psychiatrist specialty
INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (200, 2);

-- Example 2: Make therapist 202 (rishi) a Psychiatrist
DELETE FROM therapist_specialties WHERE therapist_id = 202;
INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (202, 2);

-- Example 3: Make therapist 212 (a) a Psychologist
DELETE FROM therapist_specialties WHERE therapist_id = 212;
INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (212, 1);

-- ============================================
-- BULK OPERATIONS
-- ============================================

-- Make ALL therapists Psychologists
DELETE FROM therapist_specialties;
INSERT INTO therapist_specialties (therapist_id, specialty_id)
SELECT therapist_id, 1 FROM therapists;

-- Make specific therapists Psychiatrists (replace with actual IDs)
DELETE FROM therapist_specialties WHERE therapist_id IN (200, 202);
INSERT INTO therapist_specialties (therapist_id, specialty_id) 
VALUES (200, 2), (202, 2);

-- ============================================
-- VERIFY CHANGES
-- ============================================

-- Check Psychiatrists
SELECT 
  t.therapist_id,
  t.name,
  t.email,
  'Psychiatrist' as specialty
FROM therapists t
INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
WHERE ts.specialty_id = 2
ORDER BY t.name;

-- Check Psychologists
SELECT 
  t.therapist_id,
  t.name,
  t.email,
  'Psychologist' as specialty
FROM therapists t
INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
WHERE ts.specialty_id = 1
ORDER BY t.name;

-- Check therapists WITHOUT any specialty
SELECT 
  t.therapist_id,
  t.name,
  t.email,
  'NO SPECIALTY ASSIGNED' as status
FROM therapists t
WHERE NOT EXISTS (
  SELECT 1 FROM therapist_specialties ts 
  WHERE ts.therapist_id = t.therapist_id
);
