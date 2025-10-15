# Psychiatrist List Not Showing - Troubleshooting Guide

**Date:** October 15, 2025  
**Issue:** Psychiatrist dropdown shows "-- Choose a Psychiatrist --" but no psychiatrists appear in the list

## Quick Diagnosis Steps

### Step 1: Check Debug Endpoint
Visit this URL in your browser:
```
http://localhost:3000/api/debug-psychiatrists
```

This will show you:
- ✅ Table structure of therapists table
- ✅ All therapists in database
- ✅ What specializations exist
- ✅ Whether any psychiatrists are found

### Step 2: Check Browser Console
1. Open the sessions page where you see the dropdown
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for logs starting with `=== FETCHING PSYCHIATRISTS ===`

### Step 3: Check API Response
Open in a new tab:
```
http://localhost:3000/api/psychiatrists
```

Expected response:
```json
{
  "success": true,
  "psychiatrists": [...],
  "count": 5
}
```

## Common Problems & Solutions

### Problem 1: No Therapists Marked as Psychiatrists

**Symptom:** Debug endpoint shows `psychiatristsBySpec: []`

**Cause:** No therapists have `specialization = 'psychiatrist'` in the database

**Solution:** Update existing therapists to be psychiatrists:

```sql
-- Option A: Update specific therapists by ID
UPDATE therapists 
SET specialization = 'psychiatrist'
WHERE therapist_id IN (1, 2, 3); -- Replace with actual IDs

-- Option B: Update by name
UPDATE therapists 
SET specialization = 'psychiatrist'
WHERE name LIKE '%psychiatrist%' 
   OR name LIKE '%Dr%';

-- Option C: Update therapists with specific qualifications
UPDATE therapists 
SET specialization = 'psychiatrist'
WHERE qualifications LIKE '%MD%' 
   OR qualifications LIKE '%Psychiatry%';

-- Verify the update
SELECT therapist_id, name, specialization, Interested_field
FROM therapists
WHERE specialization = 'psychiatrist' 
   OR Interested_field = 'psychiatrist';
```

### Problem 2: Wrong Column Name

**Symptom:** Column `specialization` doesn't exist

**Cause:** Database uses `Interested_field` instead of `specialization`

**Solution:** Already fixed in the updated API! The API now checks both columns:
```typescript
WHERE (t.specialization = 'psychiatrist' 
   OR t.Interested_field = 'psychiatrist')
```

If you want to standardize, run this migration:

```sql
-- Add specialization column if it doesn't exist
ALTER TABLE therapists 
ADD COLUMN IF NOT EXISTS specialization VARCHAR(100);

-- Copy from Interested_field to specialization
UPDATE therapists 
SET specialization = Interested_field
WHERE specialization IS NULL AND Interested_field IS NOT NULL;
```

### Problem 3: Wrong Column Names (experience_years vs years_experience)

**Symptom:** SQL error about column names

**Already Fixed!** The updated API now handles both:
- `years_experience` (actual column)
- `experience_years` (old column name)

### Problem 4: Case Sensitivity

**Symptom:** Therapists exist but not showing

**Cause:** Database has 'Psychiatrist' (capital P) but query looks for 'psychiatrist'

**Already Fixed!** The updated API now checks both:
```sql
WHERE (t.specialization = 'psychiatrist' 
    OR t.specialization = 'Psychiatrist' 
    OR t.Interested_field = 'psychiatrist' 
    OR t.Interested_field = 'Psychiatrist')
```

### Problem 5: No Therapists in Database at All

**Symptom:** `totalTherapists: 0` in debug endpoint

**Solution:** You need to add therapists first!

```sql
-- Create a psychiatrist
INSERT INTO therapists (
  user_id, 
  name, 
  email, 
  phone,
  password_hash,
  specialization,
  Interested_field,
  qualifications,
  years_experience,
  educational_info,
  fees_min,
  fees_max,
  rating,
  created_at
) VALUES (
  NULL, -- or a valid user_id
  'Dr. Sarah Johnson',
  'sarah.psychiatrist@example.com',
  '+1234567890',
  '$2b$10$YourHashedPasswordHere', -- Use bcrypt
  'psychiatrist',
  'Psychiatrist',
  'MD, Board Certified Psychiatrist',
  10,
  'Harvard Medical School, MD in Psychiatry',
  150,
  250,
  4.8,
  NOW()
);

-- Create another one
INSERT INTO therapists (
  user_id, 
  name, 
  email, 
  phone,
  password_hash,
  specialization,
  Interested_field,
  qualifications,
  years_experience,
  educational_info,
  fees_min,
  fees_max,
  rating,
  created_at
) VALUES (
  NULL,
  'Dr. Michael Chen',
  'michael.psychiatrist@example.com',
  '+1234567891',
  '$2b$10$YourHashedPasswordHere',
  'psychiatrist',
  'Psychiatrist',
  'MD, Child & Adolescent Psychiatrist',
  8,
  'Stanford Medical, Specialization in Youth Mental Health',
  120,
  200,
  4.9,
  NOW()
);
```

## What I Fixed in the Code

### File 1: `/app/api/psychiatrists/route.ts`

#### Fixed Column Names
```typescript
// Before:
t.experience_years,
t.consultation_fee,

// After:
t.years_experience,  // Correct column name
t.fees_min,          // Correct column name
t.fees_max,          // Added
```

#### Fixed WHERE Clause
```typescript
// Before:
WHERE t.specialization = 'psychiatrist'

// After:
WHERE (t.specialization = 'psychiatrist' 
    OR t.specialization = 'Psychiatrist' 
    OR t.Interested_field = 'psychiatrist' 
    OR t.Interested_field = 'Psychiatrist')
```

#### Added Logging
```typescript
console.log('Executing psychiatrists query...');
const psychiatrists = await query(sql);
console.log('Found psychiatrists:', psychiatrists.length);
```

#### Added Field Normalization
```typescript
return {
  ...psychiatrist,
  specialties: specialties.map(s => s.specialty_name),
  experience_years: psychiatrist.years_experience || psychiatrist.experience_years,
  consultation_fee: psychiatrist.fees_min || psychiatrist.consultation_fee
};
```

### File 2: `/app/therapist/sessions/page.tsx`

#### Added Console Logging
```typescript
console.log('=== FETCHING PSYCHIATRISTS ===');
console.log('Response status:', response.status);
console.log('Psychiatrists API response:', data);
console.log('Number of psychiatrists found:', data.psychiatrists?.length || 0);
```

#### Added Error Handling
```typescript
if (data.success) {
  setPsychiatrists(data.psychiatrists || []);
} else {
  console.error('API returned error:', data.error);
  setPsychiatrists([]);
}
```

### File 3: `/app/api/debug-psychiatrists/route.ts` (NEW)

Created comprehensive debug endpoint that shows:
- Table structure
- All therapists
- Specializations breakdown
- Psychiatrists by different column names
- Related records

## Testing Steps

### 1. Check Debug Endpoint
```
http://localhost:3000/api/debug-psychiatrists
```

**Look for:**
- `totalTherapists` - Should be > 0
- `specializations` - Should show what values exist
- `psychiatristsBySpec` or `psychiatristsByField` - Should have records

### 2. Check API Endpoint
```
http://localhost:3000/api/psychiatrists
```

**Expected:**
```json
{
  "success": true,
  "psychiatrists": [
    {
      "therapist_id": 1,
      "name": "Dr. Sarah Johnson",
      "email": "sarah@example.com",
      "specialization": "psychiatrist",
      ...
    }
  ],
  "count": 1
}
```

### 3. Check Browser Console
1. Open sessions page
2. Press F12
3. Check console for logs
4. Should see: `Number of psychiatrists found: X`

### 4. Check Dropdown
1. Go to Sessions page
2. Click on a session to add notes
3. Look for "Create Referral" section
4. Click on "Select Psychiatrist" dropdown
5. **Should now see psychiatrists!**

## SQL Queries to Help

### Check What Specializations Exist
```sql
SELECT DISTINCT 
  specialization, 
  Interested_field,
  COUNT(*) as count
FROM therapists
GROUP BY specialization, Interested_field;
```

### Find All Potential Psychiatrists
```sql
SELECT 
  therapist_id,
  name,
  email,
  specialization,
  Interested_field,
  qualifications
FROM therapists
WHERE specialization LIKE '%psych%'
   OR Interested_field LIKE '%psych%'
   OR qualifications LIKE '%psych%'
   OR name LIKE '%Dr%';
```

### Mark Therapists as Psychiatrists
```sql
-- Update specific therapists
UPDATE therapists 
SET 
  specialization = 'psychiatrist',
  Interested_field = 'Psychiatrist'
WHERE therapist_id IN (1, 2, 3); -- Your therapist IDs

-- Verify
SELECT therapist_id, name, specialization, Interested_field
FROM therapists
WHERE specialization = 'psychiatrist';
```

### Create Test Psychiatrist (Quick)
```sql
INSERT INTO therapists (
  name, email, phone, password_hash,
  specialization, Interested_field,
  qualifications, years_experience,
  fees_min, fees_max, rating, created_at
) VALUES (
  'Dr. Test Psychiatrist',
  'test.psych@example.com',
  '+1234567890',
  '$2b$10$abcdefghijklmnopqrstuvwxyz12345', -- Dummy hash
  'psychiatrist',
  'Psychiatrist',
  'MD Psychiatry',
  5,
  100,
  150,
  4.5,
  NOW()
);
```

## Verification Checklist

- [ ] Debug endpoint shows therapists exist
- [ ] At least one therapist has specialization='psychiatrist' OR Interested_field='Psychiatrist'
- [ ] API endpoint returns psychiatrists array
- [ ] Browser console shows "Number of psychiatrists found: X" (X > 0)
- [ ] Dropdown shows psychiatrist names
- [ ] Can select a psychiatrist from dropdown
- [ ] Can submit referral successfully

## Next Steps

1. **Visit:** `http://localhost:3000/api/debug-psychiatrists`
2. **Share the output** so I can see:
   - Do therapists exist?
   - What are the specialization values?
   - Which column names are being used?
3. **Check console** when you open the sessions page
4. **Share console logs** showing the psychiatrists fetch

---

**Status:** Code is updated and should work once database has psychiatrists! 
**Action Required:** Check debug endpoint and share results
