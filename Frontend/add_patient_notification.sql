-- ============================================================
-- COMPLETE NOTIFICATION FIX FOR PATIENT REFERRALS
-- Run this entire script in MySQL Workbench
-- ============================================================

USE shoi;

-- STEP 1: Check current state
-- ============================================================
SELECT '=== STEP 1: Current Notifications ===' as '';

SELECT 
    notification_id, 
    recipient_type, 
    recipient_id, 
    notification_type, 
    title,
    is_read,
    created_at
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;


-- STEP 2: Check all referrals
-- ============================================================
SELECT '=== STEP 2: All Referrals ===' as '';

SELECT 
    r.referral_id,
    r.user_id as patient_id,
    u.name as patient_name,
    rt.name as psychologist_name,
    pt.name as psychiatrist_name,
    r.status,
    r.created_at
FROM referrals r
JOIN users u ON r.user_id = u.user_id
JOIN therapists rt ON r.referring_therapist_id = rt.therapist_id
JOIN therapists pt ON r.referred_to_therapist_id = pt.therapist_id
ORDER BY r.created_at DESC;


-- STEP 3: Add patient notifications for ALL existing referrals
-- ============================================================
SELECT '=== STEP 3: Adding Patient Notifications ===' as '';

INSERT INTO notifications 
    (recipient_type, recipient_id, sender_type, sender_id, notification_type, 
     title, message, related_id, action_url, created_at, is_read)
SELECT 
    'user' as recipient_type,
    r.user_id as recipient_id,
    'therapist' as sender_type,
    r.referring_therapist_id as sender_id,
    'referral' as notification_type,
    'You Have Been Referred to a Psychiatrist' as title,
    CONCAT('Your psychologist Dr. ', rt.name, ' has referred you to Dr. ', pt.name, 
           ' for specialized psychiatric care. You can view the referral details and contact information in your Session Notes.') as message,
    r.referral_id as related_id,
    '/session-notes' as action_url,
    r.created_at as created_at,
    0 as is_read
FROM referrals r
JOIN therapists rt ON r.referring_therapist_id = rt.therapist_id
JOIN therapists pt ON r.referred_to_therapist_id = pt.therapist_id
WHERE NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.recipient_type = 'user' 
    AND n.recipient_id = r.user_id 
    AND n.related_id = r.referral_id 
    AND n.notification_type = 'referral'
);

SELECT CONCAT('✓ Added ', ROW_COUNT(), ' patient notifications') as '';


-- STEP 4: Verify patient notifications were created
-- ============================================================
SELECT '=== STEP 4: Verify Patient Notifications ===' as '';

SELECT 
    n.notification_id, 
    n.recipient_id as patient_id,
    u.name as patient_name,
    n.title,
    LEFT(n.message, 100) as message_preview,
    n.is_read,
    n.created_at,
    n.action_url
FROM notifications n
JOIN users u ON n.recipient_id = u.user_id
WHERE n.recipient_type = 'user' 
AND n.notification_type = 'referral'
ORDER BY n.created_at DESC;


-- STEP 5: Summary for user 678 (the test patient)
-- ============================================================
SELECT '=== STEP 5: Notifications for Patient 678 ===' as '';

SELECT 
    notification_id, 
    title,
    LEFT(message, 120) as message,
    is_read,
    created_at
FROM notifications 
WHERE recipient_type = 'user' 
AND recipient_id = 678
ORDER BY created_at DESC;

SELECT '=== DONE! Now refresh patient dashboard and click bell icon 🔔 ===' as '';
