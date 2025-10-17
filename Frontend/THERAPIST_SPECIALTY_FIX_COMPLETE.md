# THERAPIST SPECIALTY FIX - COMPLETE SOLUTION

## Problem Identified:
When therapists register, their data is saved in the `therapists` table, but NO entry is created in the `therapist_specialties` table. This causes:
- Referral dashboard shows "Received" tab for psychologists (should only show for psychiatrists)
- System can't determine therapist type
- Existing therapists (201-213) have NULL specialties

## Root Cause:
The `/api/therapists` POST endpoint was missing code to insert into `therapist_specialties` table after creating the therapist.

## Solution Implemented:

### 1. Fixed Registration API (`app/api/therapists/route.ts`)
**Added specialty insertion logic:**
```typescript
// After creating therapist, insert specialty:
let specialtyId = 1; // Default to Psychologist

if (therapistSpecialization === 'psychiatrist') {
  specialtyId = 2;
} else if (therapistSpecialization === 'psychologist') {
  specialtyId = 1;
} else if (therapistSpecialization === 'counselor') {
  specialtyId = 3;
} else {
  specialtyId = 1; // Default
}

await connection.execute(
  `INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (?, ?)`,
  [therapistId, specialtyId]
);
```

### 2. Registration Logic (Already Correct!)
The registration form in `app/register/page.tsx` correctly sends:

**Psychologist Registration:**
```json
{
  "name": "...",
  "email": "...",
  "password": "...",
  "university": "...",  // University name
  "certificate": "...", // Google Drive link
  "interested": "..."   // Interest field
  // NO license_no
}
```

**Psychiatrist Registration:**
```json
{
  "name": "...",
  "email": "...",
  "password": "...",
  "university": "...",  // Medical college name
  "certificate": "...", // Google Drive link
  "license_no": "...",  // License number (THIS is the key!)
  "interested": "..."
}
```

**API Detection Logic:**
```typescript
if (license_no && !specialization) {
  // Has license_no = psychiatrist
  therapistSpecialization = 'psychiatrist';
} else if (university && !license_no && !specialization) {
  // Has university but no license = psychologist
  therapistSpecialization = 'psychologist';
}
```

### 3. Fix Existing Data
Run this SQL to fix all existing therapists: `FIX_THERAPIST_SPECIALTIES.sql`

```sql
-- Assign Psychiatrist (specialty_id = 2) to therapists with keywords
INSERT INTO therapist_specialties (therapist_id, specialty_id)
SELECT t.therapist_id, 2
FROM therapists t
WHERE NOT EXISTS (
  SELECT 1 FROM therapist_specialties ts 
  WHERE ts.therapist_id = t.therapist_id
)
AND (
  LOWER(t.Interested_field) LIKE '%psychiatr%' 
  OR LOWER(t.Interested_field) LIKE '%medication%'
  OR LOWER(t.Interested_field) LIKE '%medical%'
);

-- Assign Psychologist (specialty_id = 1) to all remaining
INSERT INTO therapist_specialties (therapist_id, specialty_id)
SELECT t.therapist_id, 1
FROM therapists t
WHERE NOT EXISTS (
  SELECT 1 FROM therapist_specialties ts 
  WHERE ts.therapist_id = t.therapist_id
);
```

## Database Schema:

### specialties table:
```
specialty_id | name          | description
1           | Psychologist  | Clinical psychologist
2           | Psychiatrist  | Medical psychiatrist  
3           | Counselor     | Professional counselor
```

### therapist_specialties table:
```
therapist_id | specialty_id
212         | 1           (Psychologist)
200         | 2           (Psychiatrist)
```

## Testing:

### Step 1: Fix Existing Data
```bash
# Run the SQL file in MySQL
mysql -u root -p shoi < FIX_THERAPIST_SPECIALTIES.sql
```

### Step 2: Test New Registration
1. Go to `/register?type=therapist`
2. Register as Psychologist (university + certificate, NO license)
3. Check database: `SELECT * FROM therapist_specialties WHERE therapist_id = <new_id>`
4. Should see: `specialty_id = 1`

### Step 3: Test Psychiatrist Registration
1. Register as Psychiatrist (medical college + license + certificate)
2. Check database: Should see `specialty_id = 2`

### Step 4: Test Referral Dashboard
1. Login as psychologist → Should NOT see "Referrals Received" tab
2. Login as psychiatrist → Should see BOTH "Sent" and "Received" tabs

## Files Modified:

1. ✅ `app/api/therapists/route.ts` - Added specialty insertion on registration
2. ✅ `app/therapist/referrals/page.tsx` - Conditional tab display
3. ✅ `app/therapist/sessions/page.tsx` - Search bar for psychiatrists
4. ✅ `app/api/therapist/[therapistId]/specialties/route.ts` - New API endpoint
5. ✅ `FIX_THERAPIST_SPECIALTIES.sql` - SQL to fix existing data

## Summary:
✅ **Problem Fixed**: New registrations will now correctly insert into `therapist_specialties`
✅ **Existing Data**: Run SQL script to assign specialties to existing therapists
✅ **Future Proof**: All new registrations will automatically get the correct specialty
