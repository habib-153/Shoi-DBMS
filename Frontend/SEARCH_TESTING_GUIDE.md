# TESTING CHECKLIST - Search Functionality

## Step 1: Verify Database
Run this SQL to check psychiatrists are assigned:
```sql
SELECT 
  t.therapist_id,
  t.name,
  t.email,
  s.name as specialty
FROM therapists t
INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
INNER JOIN specialties s ON ts.specialty_id = s.specialty_id
WHERE ts.specialty_id = 2;
```

Expected result: Should show rishi (202) and raheee (207)

## Step 2: Test Psychiatrists API
Open browser console and run:
```javascript
fetch('/api/psychiatrists')
  .then(r => r.json())
  .then(d => console.log('Psychiatrists:', d));
```

Expected: Should return 2 psychiatrists (rishi and raheee)

## Step 3: Test Search Functionality
1. Login as a psychologist (NOT 202 or 207)
2. Go to Sessions page
3. Click "Refer to Psychiatrist" button
4. You should see:
   - Search bar with placeholder "Search by name or email..."
   - Dropdown showing "rishi - r@gmail.com" and "raheee ekta bhuter baccha - rahe@gmail.com"

5. Type "rishi" in search bar
   - Dropdown should only show: "rishi - r@gmail.com"

6. Type "rahe" in search bar
   - Dropdown should only show: "raheee ekta bhuter baccha - rahe@gmail.com"

7. Type "@gmail" in search bar
   - Dropdown should show BOTH psychiatrists

8. Clear search bar
   - Dropdown should show all psychiatrists again

## Step 4: Verify Referral Dashboard
1. Login as therapist 212 (a) - Psychologist
   - Should see: "Referrals Sent" tab ONLY
   - Should NOT see: "Referrals Received" tab

2. Login as therapist 202 (rishi) - Psychiatrist
   - Should see: BOTH "Referrals Sent" and "Referrals Received" tabs

3. Login as therapist 207 (raheee) - Psychiatrist
   - Should see: BOTH tabs

## Troubleshooting

### Issue: Search bar doesn't filter
**Check browser console for:**
- "=== FETCHING PSYCHIATRISTS ===" 
- "Number of psychiatrists found: X"
- Should show 2 psychiatrists

**If shows 0 psychiatrists:**
- Run SQL: `SELECT * FROM therapist_specialties WHERE specialty_id = 2;`
- Should show rows for therapist_id 202 and 207
- If empty, re-run FIX_THERAPIST_SPECIALTIES.sql

### Issue: Dropdown shows wrong names
**Problem:** The search is working but names might be null/undefined
**Check:** `SELECT therapist_id, name, email FROM therapists WHERE therapist_id IN (202, 207);`
**Fix:** Names should be "rishi" and "raheee ekta bhuter baccha"

### Issue: "Referrals Received" tab shows for psychologists
**Check:** Login as psychologist and check browser console
**Should see:** API call to `/api/therapist/212/specialties`
**Expected response:** `{"success": true, "specialties": [{"specialty_id": 1, ...}]}`
**If specialty_id is 2:** That therapist is assigned as psychiatrist (wrong!)

## Quick Fix Commands

If psychiatrists aren't showing:
```sql
-- Check assignments
SELECT ts.therapist_id, ts.specialty_id, t.name, t.email 
FROM therapist_specialties ts
JOIN therapists t ON ts.therapist_id = t.therapist_id;

-- Manually fix if needed
DELETE FROM therapist_specialties WHERE therapist_id IN (202, 207);
INSERT INTO therapist_specialties VALUES (202, 2), (207, 2);
```

If search still doesn't work after fixes:
1. Clear browser cache (Cmd+Shift+R on Mac)
2. Restart Next.js dev server
3. Check Network tab for /api/psychiatrists response
