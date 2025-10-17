# THERAPIST SPECIALTY ASSIGNMENT - YOUR DATA

Based on your database screenshot, here's what will happen:

## Current Therapists (201-213):

| ID  | Name              | Email              | Interested_field | License | Will Be Assigned |
|-----|-------------------|--------------------|------------------|---------|------------------|
| 201 | 1                 | e@email.com        | 1                | No      | Psychologist     |
| 202 | rishi             | r@gmail.com        | 1                | No      | Psychologist     |
| 203 | g                 | gi@gmail.com       | gamin            | No      | Psychologist     |
| 204 | laveo             | lablu@gmail.com    | ww               | No      | Psychologist     |
| 205 | hi                | j@yahoo.com        | 12               | No      | Psychologist     |
| 206 | qq                | qq@gmail.com       | 1122             | No      | Psychologist     |
| 207 | raheee ekta...    | rahe@gmail.com     | 111              | No      | Psychologist     |
| 208 | raheeee           | raheee@gmail.com   | 1                | No      | Psychologist     |
| 209 | MokbulBhai        | bhai@gmail.com     | sd               | No      | Psychologist     |
| 211 | MokbulBhai        | bhaii@gmail.com    | sd               | No      | Psychologist     |
| 212 | a                 | a@gmail.com        | NULL             | No      | Psychologist     |
| 213 | cat               | c@gmail.com        | 1                | No      | Psychologist     |

## Assignment Logic:

### ✅ AUTOMATIC:
1. **Has license_no?** → Psychiatrist (specialty_id = 2)
2. **No license?** → Psychologist (specialty_id = 1)

### 🎯 RESULT:
- **All 12 therapists** will be assigned as **Psychologists** (none have license_no)

### 🔧 IF YOU WANT PSYCHIATRISTS:
You need to either:
1. **Add license numbers** to therapists who are psychiatrists
2. **Manually override** using the MANUAL_SPECIALTY_ASSIGNMENT.sql file

## How to Make Someone a Psychiatrist:

### Option 1: Add License Number (Recommended)
```sql
-- Update therapist to have a license (makes them a psychiatrist)
UPDATE therapists SET license_no = 'PSY-12345' WHERE therapist_id = 202;

-- Then run the fix script
```

### Option 2: Manual Override
```sql
-- Delete current specialty
DELETE FROM therapist_specialties WHERE therapist_id = 202;

-- Assign Psychiatrist
INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (202, 2);
```

## Quick Test Scenario:

If you want to test with:
- **202 (rishi)** as Psychiatrist
- **212 (a)** as Psychologist  
- Everyone else as Psychologist

Run this:
```sql
-- First, run FIX_THERAPIST_SPECIALTIES.sql to assign everyone as Psychologist

-- Then override rishi to be Psychiatrist
DELETE FROM therapist_specialties WHERE therapist_id = 202;
INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (202, 2);

-- Verify
SELECT 
  t.therapist_id,
  t.name,
  s.name as specialty
FROM therapists t
LEFT JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
LEFT JOIN specialties s ON ts.specialty_id = s.specialty_id
WHERE t.therapist_id IN (202, 212);
```

## Expected Results After Fix:

✅ Therapist 212 (a) logs in → Only sees "Referrals Sent" tab
✅ Therapist 202 (rishi) - If made psychiatrist → Sees both "Sent" and "Received" tabs
✅ Search bar works for finding psychiatrists
✅ New registrations automatically get correct specialty
