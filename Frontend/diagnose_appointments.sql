-- ============================================
-- COMPREHENSIVE APPOINTMENTS DIAGNOSTIC SCRIPT
-- ============================================
-- Run this in your MySQL console to diagnose appointment issues
-- ============================================

-- 1. CHECK IF APPOINTMENTS TABLE EXISTS
SHOW TABLES LIKE 'appointments';

-- 2. CHECK TABLE STRUCTURE
DESCRIBE appointments;

-- 3. COUNT TOTAL APPOINTMENTS
SELECT COUNT(*) as total_appointments FROM appointments;

-- 4. CHECK ALL APPOINTMENTS WITH DETAILS
SELECT 
  a.appointment_id,
  a.user_id,
  a.therapist_id,
  a.start_time,
  a.end_time,
  a.status,
  a.created_at,
  u.name as user_name,
  t.name as therapist_name,
  CASE 
    WHEN a.start_time > NOW() THEN '✅ FUTURE'
    ELSE '❌ PAST'
  END as time_status
FROM appointments a
LEFT JOIN users u ON a.user_id = u.user_id
LEFT JOIN therapists t ON a.therapist_id = t.therapist_id
ORDER BY a.start_time DESC
LIMIT 20;

-- 5. CHECK STATUS BREAKDOWN
SELECT 
  status,
  COUNT(*) as count,
  MIN(start_time) as earliest,
  MAX(start_time) as latest
FROM appointments
GROUP BY status;

-- 6. CHECK FUTURE APPOINTMENTS
SELECT 
  COUNT(*) as future_appointments_count,
  MIN(start_time) as next_appointment,
  MAX(start_time) as last_appointment
FROM appointments
WHERE start_time > NOW();

-- 7. CHECK APPOINTMENTS BY THERAPIST
SELECT 
  a.therapist_id,
  t.name as therapist_name,
  COUNT(*) as total_appointments,
  SUM(CASE WHEN a.start_time > NOW() THEN 1 ELSE 0 END) as future_appointments,
  SUM(CASE WHEN a.status IN ('confirmed', 'pending', 'scheduled') THEN 1 ELSE 0 END) as active_appointments
FROM appointments a
LEFT JOIN therapists t ON a.therapist_id = t.therapist_id
GROUP BY a.therapist_id, t.name
ORDER BY total_appointments DESC;

-- 8. CHECK IF YOU HAVE USERS
SELECT COUNT(*) as total_users FROM users;

-- 9. CHECK IF YOU HAVE THERAPISTS  
SELECT 
  therapist_id,
  user_id,
  name,
  email,
  specialization
FROM therapists
LIMIT 10;

-- 10. FIND APPOINTMENTS FOR SPECIFIC THERAPIST (REPLACE 123 WITH YOUR ID)
-- First, find your therapist_id from step 9, then run this:
/*
SET @therapist_id = 123; -- REPLACE WITH YOUR ACTUAL THERAPIST_ID

SELECT 
  a.appointment_id,
  a.user_id,
  u.name as user_name,
  a.start_time,
  a.end_time,
  a.status,
  CASE 
    WHEN a.start_time > NOW() THEN '✅ FUTURE'
    ELSE '❌ PAST'
  END as time_status,
  CASE
    WHEN a.status IN ('confirmed', 'pending', 'scheduled') THEN '✅ SHOULD SHOW'
    ELSE '❌ WON\'T SHOW'
  END as visibility
FROM appointments a
LEFT JOIN users u ON a.user_id = u.user_id
WHERE a.therapist_id = @therapist_id
ORDER BY a.start_time DESC;
*/

-- ============================================
-- IF NO APPOINTMENTS EXIST, CREATE TEST DATA
-- ============================================
-- IMPORTANT: Replace these values:
-- @therapist_id = Your actual therapist_id from step 9
-- @user_id = A valid user_id (usually 1 or get from: SELECT user_id FROM users LIMIT 1)

/*
SET @therapist_id = 123; -- REPLACE WITH YOUR THERAPIST_ID
SET @user_id = 1; -- REPLACE WITH A VALID USER_ID

-- Create 3 test appointments
INSERT INTO appointments (user_id, therapist_id, start_time, end_time, status, created_at)
VALUES
  -- Tomorrow at 10 AM
  (@user_id, @therapist_id, 
   DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 10 HOUR,
   DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 11 HOUR,
   'confirmed', NOW()),
   
  -- Day after tomorrow at 2 PM
  (@user_id, @therapist_id,
   DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 14 HOUR,
   DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 15 HOUR,
   'pending', NOW()),
   
  -- Next week at 9 AM
  (@user_id, @therapist_id,
   DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 9 HOUR,
   DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 10 HOUR,
   'scheduled', NOW());

-- Verify creation
SELECT * FROM appointments WHERE therapist_id = @therapist_id ORDER BY created_at DESC LIMIT 3;
*/

-- ============================================
-- IF APPOINTMENTS EXIST BUT ARE IN THE PAST, UPDATE THEM
-- ============================================

/*
SET @therapist_id = 123; -- REPLACE WITH YOUR THERAPIST_ID

-- Move all past appointments to future dates (starting tomorrow)
UPDATE appointments
SET 
  start_time = DATE_ADD(CURDATE(), INTERVAL 1 + appointment_id DAY) + INTERVAL 10 HOUR,
  end_time = DATE_ADD(CURDATE(), INTERVAL 1 + appointment_id DAY) + INTERVAL 11 HOUR,
  status = CASE 
    WHEN status NOT IN ('confirmed', 'pending', 'scheduled') THEN 'confirmed'
    ELSE status
  END
WHERE therapist_id = @therapist_id
  AND start_time < NOW();

-- Verify update
SELECT * FROM appointments WHERE therapist_id = @therapist_id ORDER BY start_time ASC;
*/

-- ============================================
-- FINAL VERIFICATION QUERY
-- ============================================
-- Run this to see what should appear on dashboard
-- Replace @therapist_id with your actual ID

/*
SET @therapist_id = 123; -- REPLACE WITH YOUR THERAPIST_ID

SELECT 
  a.appointment_id,
  u.name as user_name,
  a.start_time,
  a.status,
  '✅ SHOULD SHOW ON DASHBOARD' as dashboard_status
FROM appointments a
JOIN users u ON a.user_id = u.user_id
WHERE a.therapist_id = @therapist_id
  AND a.start_time >= CURDATE()
  AND a.status IN ('confirmed', 'pending', 'scheduled')
ORDER BY a.start_time ASC
LIMIT 5;
*/

-- ============================================
-- COMMON ISSUES CHECKLIST
-- ============================================
-- ✅ Appointments table exists
-- ✅ Appointments have valid user_id and therapist_id
-- ✅ Appointments have future dates (start_time > NOW())
-- ✅ Appointments have correct status (confirmed/pending/scheduled)
-- ✅ Users and therapists tables have matching records
-- ✅ Therapist is logged in with correct therapist_id in localStorage
