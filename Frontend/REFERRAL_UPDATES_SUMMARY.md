# Referral System Updates - Summary

## Changes Made:

### 1. **Referral Dashboard - Conditional Tab Display**
   - **File**: `app/therapist/referrals/page.tsx`
   - **Changes**:
     - Added `isPsychiatrist` state to track if the logged-in therapist is a psychiatrist
     - Created `checkIfPsychiatrist()` function that calls the new specialties API
     - **"Referrals Received" tab now only shows for psychiatrists**
     - Psychologists only see "Referrals Sent" tab
   
   - **Logic**: 
     - Checks if therapist has `specialty_id = 2` (Psychiatrist)
     - If YES → Shows both "Sent" and "Received" tabs
     - If NO → Shows only "Sent" tab

### 2. **Psychiatrist Selection - Search Bar**
   - **File**: `app/therapist/sessions/page.tsx`
   - **Changes**:
     - Added `psychiatristSearch` state for search input
     - Added search input field above the psychiatrist dropdown
     - Filters psychiatrists by name or email in real-time
     - Shows helpful message when no matches found
     - Search is cleared when modal opens
   
   - **Features**:
     - Case-insensitive search
     - Searches in both name and email fields
     - Dynamic filtering as you type
     - Shows count of filtered results

### 3. **New API Endpoint - Therapist Specialties**
   - **File**: `app/api/therapist/[therapistId]/specialties/route.ts`
   - **Purpose**: Get specialties for a specific therapist
   - **Response**: Returns array of specialties with:
     - `therapist_id`
     - `specialty_id` (1 = Psychologist, 2 = Psychiatrist, etc.)
     - `specialty_name`
     - `specialty_description`

### 4. **Diagnostic SQL File**
   - **File**: `CHECK_THERAPIST_SPECIALTIES.sql`
   - **Purpose**: Check current therapist specialties in database
   - **Queries**:
     - List all therapists with their specialties
     - Show all available specialties
     - Find all psychiatrists
     - Find all psychologists

## How It Works:

### For Psychologists:
1. Log in → Go to Referrals page
2. Only see "Referrals Sent" tab
3. Can create referrals to psychiatrists
4. Cannot see "Referrals Received" tab

### For Psychiatrists:
1. Log in → Go to Referrals page
2. See both "Referrals Sent" and "Referrals Received" tabs
3. Can receive referrals from psychologists
4. Can also send referrals if needed

### When Creating a Referral:
1. Click "Refer to Psychiatrist" button
2. Search bar appears above psychiatrist dropdown
3. Type name or email to filter psychiatrists
4. Select from filtered list
5. Fill in referral details
6. Submit

## Database Requirements:

### Tables Used:
- `therapist_specialties` - Links therapists to their specialties
- `specialties` - Defines specialty types
  - `specialty_id = 1` → Psychologist
  - `specialty_id = 2` → Psychiatrist

### Example Data Structure:
```sql
-- Specialties table
specialty_id | name          | description
1           | Psychologist  | Clinical psychologist
2           | Psychiatrist  | Medical psychiatrist

-- Therapist_specialties table
therapist_id | specialty_id
212         | 1           (Psychologist)
213         | 2           (Psychiatrist)
```

## Testing Checklist:

1. ✅ Run `CHECK_THERAPIST_SPECIALTIES.sql` to verify data
2. ✅ Login as psychologist → Should NOT see "Referrals Received" tab
3. ✅ Login as psychiatrist → Should see both tabs
4. ✅ Open referral modal → Search bar should appear
5. ✅ Type in search → List should filter
6. ✅ Clear search → All psychiatrists should show
7. ✅ Close and reopen modal → Search should be cleared

## Notes:

- The system determines psychiatrist status by checking `specialty_id = 2` in the database
- If a therapist has no specialties assigned, they will be treated as a psychologist (no received tab)
- Search is real-time and doesn't require clicking a search button
- Empty search shows all psychiatrists
