-- FIX EXISTING THERAPIST SPECIALTIES
-- Based on your actual data analysis

-- =============================================
-- STEP 1: View current therapist data
-- =============================================
SELECT 
  t.therapist_id, 
  t.name, 
  t.email, 
  t.Interested_field,
  t.license_no,
  CASE 
    WHEN t.license_no IS NOT NULL THEN 'Has License → Likely Psychiatrist'
    WHEN t.Interested_field IS NULL THEN 'No Info → Default to Psychologist'
    ELSE 'No License → Psychologist'
  END as recommendation
FROM therapists t
WHERE NOT EXISTS (
  SELECT 1 FROM therapist_specialties ts 
  WHERE ts.therapist_id = t.therapist_id
)
ORDER BY t.therapist_id;

-- =============================================
-- STEP 2: SMART ASSIGNMENT LOGIC
-- =============================================

-- First Priority: Assign based on license_no
-- If they have a medical license, they are a Psychiatrist
INSERT INTO therapist_specialties (therapist_id, specialty_id)
SELECT t.therapist_id, 2
FROM therapists t
WHERE NOT EXISTS (
  SELECT 1 FROM therapist_specialties ts 
  WHERE ts.therapist_id = t.therapist_id
)
AND t.license_no IS NOT NULL
AND TRIM(t.license_no) != '';

-- Second Priority: Check Interested_field for psychiatry keywords
INSERT INTO therapist_specialties (therapist_id, specialty_id)
SELECT t.therapist_id, 2
FROM therapists t
WHERE NOT EXISTS (
  SELECT 1 FROM therapist_specialties ts 
  WHERE ts.therapist_id = t.therapist_id
)
AND t.Interested_field IS NOT NULL
AND (
  LOWER(t.Interested_field) LIKE '%psychiatr%' 
  OR LOWER(t.Interested_field) LIKE '%medication%'
  OR LOWER(t.Interested_field) LIKE '%medical%'
  OR LOWER(t.Interested_field) LIKE '%pharmacolog%'
);

-- Third Priority: Looking at your data specifically
-- therapist_id 201, 202, 208, 213 have "1" in Interested_field → Generic/Psychologist
-- therapist_id 203 = "gamin" → Gaming therapy (Psychologist)
-- therapist_id 204 = "ww" → Unknown (Psychologist)
-- therapist_id 205 = "12" → Generic (Psychologist)
-- therapist_id 206 = "1122" → Generic (Psychologist)
-- therapist_id 207 = "111" → Generic (Psychologist)
-- therapist_id 209, 211 = "sd" → Unknown (Psychologist)
-- therapist_id 212 = NULL → Default (Psychologist)

-- Assign Psychologist (specialty_id = 1) to ALL remaining therapists
INSERT INTO therapist_specialties (therapist_id, specialty_id)
SELECT t.therapist_id, 1
FROM therapists t
WHERE NOT EXISTS (
  SELECT 1 FROM therapist_specialties ts 
  WHERE ts.therapist_id = t.therapist_id
);

-- =============================================
-- STEP 3: MANUAL OVERRIDES - SPECIFIC PSYCHIATRISTS
-- =============================================
-- Making rishi (202) and raheee (207) psychiatrists as requested

-- Make therapist_id 202 (rishi) a Psychiatrist
DELETE FROM therapist_specialties WHERE therapist_id = 202;
INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (202, 2);

-- Make therapist_id 207 (raheee ekta bhuter baccha) a Psychiatrist
DELETE FROM therapist_specialties WHERE therapist_id = 207;
INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (207, 2);

-- =============================================
-- STEP 4: VERIFY THE RESULTS
-- =============================================
SELECT 
  t.therapist_id,
  t.name,
  t.email,
  t.Interested_field,
  t.license_no,
  COALESCE(s.name, 'NOT ASSIGNED') as specialty,
  COALESCE(s.specialty_id, 0) as specialty_id
FROM therapists t
LEFT JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
LEFT JOIN specialties s ON ts.specialty_id = s.specialty_id
ORDER BY t.therapist_id;

-- =============================================
-- SUMMARY COUNT
-- =============================================
SELECT 
  COALESCE(s.name, 'NO SPECIALTY') as specialty_type,
  COUNT(*) as therapist_count
FROM therapists t
LEFT JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
LEFT JOIN specialties s ON ts.specialty_id = s.specialty_id
GROUP BY s.name;
