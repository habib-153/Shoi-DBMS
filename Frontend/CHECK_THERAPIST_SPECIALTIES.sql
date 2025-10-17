-- Check therapist specialties
SELECT 
  t.therapist_id,
  t.name,
  t.email,
  GROUP_CONCAT(s.name) as specialties,
  GROUP_CONCAT(s.specialty_id) as specialty_ids
FROM therapists t
LEFT JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
LEFT JOIN specialties s ON ts.specialty_id = s.specialty_id
GROUP BY t.therapist_id, t.name, t.email
ORDER BY t.therapist_id;

-- Check what specialties exist
SELECT * FROM specialties;

-- Find psychiatrists (specialty_id = 2)
SELECT 
  t.therapist_id,
  t.name,
  t.email,
  s.name as specialty_name
FROM therapists t
INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
INNER JOIN specialties s ON ts.specialty_id = s.specialty_id
WHERE s.specialty_id = 2;

-- Find psychologists (specialty_id = 1)
SELECT 
  t.therapist_id,
  t.name,
  t.email,
  s.name as specialty_name
FROM therapists t
INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
INNER JOIN specialties s ON ts.specialty_id = s.specialty_id
WHERE s.specialty_id = 1;
