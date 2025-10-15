# Referral System Bug Fix

**Date:** October 14, 2025  
**Issue:** "Failed to create referral" error when submitting psychiatric referral

## Root Causes Identified

### 1. Missing Psychiatrist Selection
- **Problem:** The referral form didn't have a field to select which psychiatrist to refer to
- **Impact:** `referred_to_therapist_id` was always null, causing database trigger to fail
- **Database Trigger:** Our security trigger validates that `referred_to_therapist_id` points to a psychiatrist

### 2. Moderate Severity Still Allowed
- **Problem:** UI showed "Moderate" as an option despite database CHECK constraint
- **Database Constraint:** `CONSTRAINT chk_severity CHECK (severity_level IN ('severe', 'critical'))`
- **Impact:** Would fail silently if user selected "moderate"

### 3. Missing Frontend Validation
- **Problem:** No validation to ensure psychiatrist is selected before submission
- **Impact:** Could submit incomplete referral data

## Fixes Implemented

### 1. Updated ReferralForm Interface
```typescript
interface ReferralForm {
  referred_to_therapist_id: number | null;  // ✅ Added
  reason: string;
  severity_level: 'severe' | 'critical';     // ✅ Changed from 'moderate' | 'severe' | 'critical'
  symptoms: string;
  current_medication: string;
  additional_notes: string;
}
```

### 2. Added Psychiatrist Fetching
- Created `fetchPsychiatrists()` function
- Fetches from `/api/psychiatrists` endpoint
- Calls when referral modal opens
- Stores in `psychiatrists` state

### 3. Added Psychiatrist Selection UI
```tsx
<select
  value={referralForm.referred_to_therapist_id || ''}
  onChange={(e) => setReferralForm({ 
    ...referralForm, 
    referred_to_therapist_id: Number(e.target.value) || null 
  })}
>
  <option value="">-- Choose a Psychiatrist --</option>
  {psychiatrists.map((psych) => (
    <option key={psych.therapist_id} value={psych.therapist_id}>
      {psych.name} - {psych.email}
    </option>
  ))}
</select>
```

### 4. Updated Severity Selection
- **Before:** 3 options (Moderate, Severe, Critical) in 3-column grid
- **After:** 2 options (Severe, Critical) in 2-column grid
- Added helper text: "Only severe or critical cases can be referred to psychiatrists"

### 5. Enhanced Validation

#### Frontend Validation
```typescript
if (!referralForm.referred_to_therapist_id) {
  alert('Please select a psychiatrist to refer to');
  return;
}
```

#### Submit Button Disabled State
```typescript
disabled={
  submittingReferral || 
  !referralForm.reason.trim() || 
  !referralForm.referred_to_therapist_id  // ✅ Added
}
```

### 6. API Validation Improvements

#### Required Field Check
```typescript
if (!user_id || !referring_therapist_id || !reason || !referred_to_therapist_id) {
  return NextResponse.json(
    { success: false, error: 'user_id, referring_therapist_id, referred_to_therapist_id, and reason are required' },
    { status: 400 }
  );
}
```

#### Severity Validation
```typescript
if (!['severe', 'critical'].includes(severity_level)) {
  return NextResponse.json(
    { success: false, error: 'severity_level must be severe or critical (moderate cases cannot be referred to psychiatrists)' },
    { status: 400 }
  );
}
```

#### Psychiatrist Verification
```typescript
const psychiatrist = await query(
  'SELECT therapist_id, name, specialization FROM therapists WHERE therapist_id = ?',
  [referred_to_therapist_id]
);

if (psychiatrist.length === 0) {
  return NextResponse.json(
    { success: false, error: 'Specified psychiatrist not found' },
    { status: 404 }
  );
}

if (psychiatrist[0].specialization !== 'psychiatrist') {
  return NextResponse.json(
    { success: false, error: 'Can only refer to psychiatrists. The selected therapist is not a psychiatrist.' },
    { status: 400 }
  );
}
```

## Multi-Layer Validation Summary

Now the system has **4 layers of validation** to ensure data integrity:

### Layer 1: UI (Most User-Friendly)
- ✅ Dropdown only shows psychiatrists
- ✅ Only Severe/Critical severity options
- ✅ Submit button disabled until psychiatrist selected
- ✅ Helpful error messages

### Layer 2: Frontend Logic
- ✅ JavaScript validation before API call
- ✅ Alert if psychiatrist not selected
- ✅ TypeScript type safety

### Layer 3: API Backend
- ✅ Required field validation
- ✅ Severity level validation
- ✅ Psychiatrist existence check
- ✅ Specialization verification
- ✅ Clear error messages

### Layer 4: Database (Strongest)
- ✅ CHECK constraint on severity_level
- ✅ BEFORE INSERT trigger validates psychiatrist
- ✅ BEFORE UPDATE trigger validates psychiatrist
- ✅ Foreign key constraints
- ✅ Audit trail in referral_tracking table

## Files Modified

1. **app/therapist/sessions/page.tsx**
   - Updated `ReferralForm` interface
   - Added `psychiatrists` state
   - Added `fetchPsychiatrists()` function
   - Added psychiatrist selection dropdown
   - Removed "moderate" severity option
   - Enhanced validation logic

2. **app/api/referrals/route.ts**
   - Made `referred_to_therapist_id` required
   - Updated severity validation to only allow severe/critical
   - Made psychiatrist verification mandatory (not optional)
   - Improved error messages
   - Removed null fallback for `referred_to_therapist_id`

3. **database_referral_setup.sql** (Previously completed)
   - CHECK constraint for severity
   - Triggers for psychiatrist validation
   - View for referral tracking
   - Audit table

## Testing Checklist

- [ ] Open session notes and click "Refer to Psychiatrist"
- [ ] Verify psychiatrist dropdown shows all psychiatrists
- [ ] Verify only "Severe" and "Critical" options available
- [ ] Try submitting without selecting psychiatrist (should alert)
- [ ] Try submitting without reason (should alert)
- [ ] Select psychiatrist, fill all fields, submit
- [ ] Verify referral appears in `/therapist/referrals`
- [ ] Check referral_tracking table for audit entry

## Error Messages Improved

### Before
- "Failed to create referral: Failed to create referral" ❌
- Generic 500 error

### After
- "Please select a psychiatrist to refer to" ✅
- "severity_level must be severe or critical (moderate cases cannot be referred to psychiatrists)" ✅
- "Can only refer to psychiatrists. The selected therapist is not a psychiatrist." ✅
- "Specified psychiatrist not found" ✅

## Impact

This fix ensures:
1. **Data Integrity:** Only valid referrals enter the database
2. **User Experience:** Clear guidance and helpful error messages
3. **Security:** Multi-layer validation prevents bypassing rules
4. **Compliance:** Audit trail tracks all referral actions
5. **Business Logic:** Enforces "only psychiatrists" rule at all levels

## Next Steps

1. Test the complete referral flow
2. Monitor for any new errors in console
3. Consider adding psychiatrist availability checking
4. Future: Add email notifications to selected psychiatrist
