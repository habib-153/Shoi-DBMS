# SQL Queries Used in the Project

## Authentication and User Management

```sql
-- Check user credentials
SELECT * FROM users WHERE email = ? AND password_hash = ?;

-- Check therapist credentials
SELECT * FROM therapists WHERE email = ? AND password_hash = ?;

-- Get user profile
SELECT * FROM users WHERE user_id = ?;

-- Get therapist profile
SELECT * FROM therapists WHERE therapist_id = ?;

-- Update user privacy settings
UPDATE privacy_settings 
SET allow_messages = ?, appointment_reminders = ? 
WHERE user_id = ?;
```

## Appointments and Sessions

```sql
-- Get therapist's appointments for a specific date
SELECT 
    a.*,
    u.name as user_name,
    u.email as user_email,
    u.phone as user_phone
FROM appointments a
JOIN users u ON a.user_id = u.user_id
WHERE a.therapist_id = ? 
AND DATE(start_time) = ?;

-- Get all sessions for a therapist
SELECT 
    s.*,
    a.start_time,
    a.end_time,
    a.status as appointment_status,
    a.created_at as appointment_created_at,
    u.user_id,
    u.name as user_name,
    u.email as user_email,
    (SELECT COUNT(*) FROM session_notes sn WHERE sn.session_id = s.session_id) as has_notes,
    (SELECT note_id FROM session_notes sn WHERE sn.session_id = s.session_id ORDER BY sn.created_at DESC LIMIT 1) as note_id,
    (SELECT summary FROM session_notes sn WHERE sn.session_id = s.session_id ORDER BY sn.created_at DESC LIMIT 1) as note_summary
FROM sessions s
JOIN appointments a ON s.appointment_id = a.appointment_id
JOIN users u ON a.user_id = u.user_id
WHERE a.therapist_id = ?;

-- Add session note
INSERT INTO session_notes (
    note_id,
    session_id,
    summary,
    homework,
    therapist_private_notes,
    visible_to_user,
    created_at
) VALUES (?, ?, ?, ?, ?, ?, NOW());

-- Get session notes
SELECT * FROM session_notes WHERE session_id = ?;

-- Get session rating
SELECT rating_by_user FROM sessions WHERE session_id = ?;

-- Update session rating
UPDATE sessions SET rating_by_user = ? WHERE session_id = ?;
```

## Assessments

```sql
-- Get assessment types
SELECT 
    at.*,
    t.name as creator_name,
    (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = at.assessment_id) as question_count
FROM assessment_types at
LEFT JOIN therapists t ON at.created_by_therapist_id = t.therapist_id
WHERE at.is_default = 1 OR at.created_by_therapist_id = ?;

-- Get assigned assessments
SELECT 
    aa.*,
    at.name as assessment_name,
    at.assessment_type,
    u.name as patient_name,
    aa.assigned_at,
    aa.due_date,
    aa.status,
    aa.completed_at,
    COALESCE(
        (SELECT AVG(response_value) 
         FROM assessment_responses ar 
         WHERE ar.assignment_id = aa.assignment_id
        ), 0
    ) as score
FROM assessment_assignments aa
JOIN assessment_types at ON aa.assessment_id = at.assessment_id
JOIN users u ON aa.user_id = u.user_id
WHERE aa.therapist_id = ?;

-- Get assessment questions
SELECT * FROM assessment_questions WHERE assessment_id = ? ORDER BY question_order;
```

## Messages

```sql
-- Get chat messages
SELECT 
    m.*,
    CASE 
        WHEN m.sender_type = 'user' THEN u.name
        WHEN m.sender_type = 'therapist' THEN t.name
    END as sender_name
FROM messages m
LEFT JOIN users u ON m.sender_type = 'user' AND m.sender_id = u.user_id
LEFT JOIN therapists t ON m.sender_type = 'therapist' AND m.sender_id = t.therapist_id
WHERE (
    (m.sender_type = ? AND m.sender_id = ? AND m.recipient_type = ? AND m.recipient_id = ?)
    OR 
    (m.sender_type = ? AND m.sender_id = ? AND m.recipient_type = ? AND m.recipient_id = ?)
)
ORDER BY m.sent_at;

-- Check message privacy settings
SELECT allow_messages FROM privacy_settings WHERE user_id = ?;

-- Insert new message
INSERT INTO messages (
    message_id,
    sender_type,
    sender_id,
    recipient_type,
    recipient_id,
    content,
    sent_at,
    read_at
) VALUES (?, ?, ?, ?, ?, ?, NOW(), NULL);
```

## Notifications

```sql
-- Get notifications
SELECT * FROM notifications 
WHERE recipient_type = ? 
AND recipient_id = ?
ORDER BY created_at DESC
LIMIT ?;

-- Count unread notifications
SELECT COUNT(*) as count FROM notifications 
WHERE recipient_type = ? 
AND recipient_id = ?
AND read_at IS NULL;

-- Create notification
INSERT INTO notifications (
    notification_id,
    recipient_type,
    recipient_id,
    type,
    title,
    message,
    action_url,
    created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, NOW());

-- Mark notifications as read
UPDATE notifications 
SET read_at = NOW() 
WHERE recipient_type = ? 
AND recipient_id = ?
AND read_at IS NULL;

-- Delete notification
DELETE FROM notifications WHERE notification_id = ?;

-- Delete all notifications
DELETE FROM notifications 
WHERE recipient_type = ? 
AND recipient_id = ?;
```

## Specialties and Resources

```sql
-- Get therapist specialties
SELECT 
    s.*,
    ts.added_at
FROM specialties s
JOIN therapist_specialties ts ON s.specialty_id = ts.specialty_id
WHERE ts.therapist_id = ?;

-- Add specialty to therapist
INSERT INTO therapist_specialties (therapist_id, specialty_id, added_at)
VALUES (?, ?, NOW());

-- Remove specialty from therapist
DELETE FROM therapist_specialties WHERE therapist_id = ? AND specialty_id = ?;

-- Get user resources
SELECT 
    r.*,
    ur.assigned_at,
    ur.completed_at,
    ur.progress
FROM resources r
JOIN user_resources ur ON r.resource_id = ur.resource_id
WHERE ur.user_id = ?;

-- Assign resource to user
INSERT INTO user_resources (user_id, resource_id, assigned_at)
VALUES (?, ?, NOW());

-- Update resource progress
UPDATE user_resources 
SET progress = ?, updated_at = NOW()
WHERE user_id = ? AND resource_id = ?;
```

## Analytics and Stats

```sql
-- Get therapist stats
SELECT 
    COUNT(DISTINCT user_id) as total_patients 
FROM appointments 
WHERE therapist_id = ?;

SELECT COUNT(*) as completed_sessions 
FROM sessions s
JOIN appointments a ON s.appointment_id = a.appointment_id
WHERE a.therapist_id = ?;

SELECT COUNT(*) as today_appointments 
FROM appointments 
WHERE therapist_id = ? 
AND DATE(start_time) = CURDATE();

SELECT AVG(s.rating_by_user) as avg_rating 
FROM sessions s
JOIN appointments a ON s.appointment_id = a.appointment_id
WHERE a.therapist_id = ? 
AND s.rating_by_user IS NOT NULL;

-- Get user analytics
SELECT 
    COUNT(*) as total_appointments,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_appointments,
    COUNT(DISTINCT therapist_id) as unique_therapists
FROM appointments
WHERE user_id = ?;

SELECT 
    COUNT(*) as total_assessments,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_assessments,
    AVG(CASE 
        WHEN status = 'completed' 
        THEN (
            SELECT AVG(response_value) 
            FROM assessment_responses ar 
            WHERE ar.assignment_id = aa.assignment_id
        )
        ELSE NULL 
    END) as avg_score
FROM assessment_assignments aa
WHERE user_id = ?;
```

## Referrals

```sql
-- Create referral
INSERT INTO referrals (
    referral_id,
    user_id,
    referring_therapist_id,
    referred_to_therapist_id,
    session_id,
    reason,
    severity_level,
    symptoms,
    current_medication,
    additional_notes,
    status,
    created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW());

-- Get referrals for therapist
SELECT 
    r.*,
    u.name as patient_name,
    u.email as patient_email,
    t1.name as referring_therapist_name,
    t2.name as referred_to_therapist_name
FROM referrals r
JOIN users u ON r.user_id = u.user_id
JOIN therapists t1 ON r.referring_therapist_id = t1.therapist_id
JOIN therapists t2 ON r.referred_to_therapist_id = t2.therapist_id
WHERE r.referring_therapist_id = ? OR r.referred_to_therapist_id = ?;

-- Update referral status
UPDATE referrals 
SET status = ?, updated_at = NOW()
WHERE referral_id = ?;
```

## Administrative Queries

```sql
-- Create new user
INSERT INTO users (
    user_id,
    name,
    email,
    password_hash,
    created_at
) VALUES (?, ?, ?, ?, NOW());

-- Create new therapist
INSERT INTO therapists (
    therapist_id,
    name,
    email,
    password_hash,
    license_no,
    years_experience,
    bio,
    created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, NOW());

-- Update therapist profile
UPDATE therapists 
SET 
    name = ?,
    bio = ?,
    years_experience = ?,
    fees_min = ?,
    fees_max = ?,
    languages = ?
WHERE therapist_id = ?;

-- Update user profile
UPDATE users 
SET 
    name = ?,
    phone = ?,
    address = ?,
    dob = ?,
    gender = ?
WHERE user_id = ?;
```