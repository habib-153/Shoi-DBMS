# Therapist Dashboard & Sessions Fixes

## Fix #1: Status Field Error in Sessions Page

### Issue
Runtime error in `/app/therapist/sessions/page.tsx`:
```
Error: undefined is not an object (evaluating 'session.status.replace')
```

### Root Cause
The `session.status` field was undefined for some session records. The API was returning `appointment_status` instead of `status`, or the field was null in the database.

### Solution Applied

#### 1. Updated Session Interface
Made both `status` and `appointment_status` optional fields:
```typescript
interface Session {
  // ... other fields
  status?: string;
  appointment_status?: string;
}
```

#### 2. Added Fallback Logic in Filter Function
Updated the filtering logic to handle undefined status:
```typescript
const filteredSessions = sessions.filter(session => {
  const matchesSearch = session.user_name.toLowerCase().includes(searchTerm.toLowerCase());
  const sessionStatus = session.status || session.appointment_status || 'completed';
  const matchesStatus = filterStatus === 'all' || sessionStatus === filterStatus;
  return matchesSearch && matchesStatus;
});
```

#### 3. Fixed Status Display in UI
Updated the status badge to use fallback values:
```typescript
<span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session.status || session.appointment_status || 'completed')}`}>
  {(session.status || session.appointment_status || 'completed').replace('_', ' ')}
</span>
```

#### 4. Fixed Conditional Rendering
Updated button visibility conditions:
```typescript
// Before
{session.status === 'scheduled' && (...)}
{session.status === 'in_progress' && (...)}

// After
{(session.status || session.appointment_status) === 'scheduled' && (...)}
{(session.status || session.appointment_status) === 'in_progress' && (...)}
```

---

## Fix #2: Upcoming Appointments Not Showing on Dashboard

**Date:** October 15, 2025  
**Issue:** Upcoming appointments not displaying on therapist dashboard

### Problems Identified

#### 1. API Status Filter Not Working
**Problem:** The dashboard was passing `status=confirmed,pending` but the API only accepted single status values.

**Before:**
```typescript
if (status) {
  sql += ` AND a.status = ?`;  // Only handles single value
  params_array.push(status);
}
```

**After:**
```typescript
if (status) {
  // Handle comma-separated status values
  const statusValues = status.split(',').map(s => s.trim());
  const placeholders = statusValues.map(() => '?').join(',');
  sql += ` AND a.status IN (${placeholders})`;
  params_array.push(...statusValues);
}
```

#### 2. No Future Date Filter
**Problem:** API was returning all appointments including past ones.

**Fix Added:**
```typescript
// Only show future or today's appointments for upcoming view
if (!date) {
  sql += ` AND a.start_time >= CURDATE()`;
}
```

#### 3. Dashboard Not Filtering Future Appointments
**Problem:** Even if API returned appointments, dashboard wasn't filtering for future only.

**Fix Added:**
```typescript
// Filter for future appointments only
const now = new Date();
const futureAppointments = (data.appointments || [])
  .filter((apt: Appointment) => new Date(apt.start_time) > now)
  .slice(0, 5);
```

#### 4. Missing Status Value
**Problem:** Dashboard was only checking 'confirmed' and 'pending', missing 'scheduled'.

**Before:**
```typescript
status=confirmed,pending
```

**After:**
```typescript
status=confirmed,pending,scheduled
```

### Changes Made

#### File 1: `app/api/therapists/[id]/appointments/route.ts`

**Change 1: Multiple Status Support**
- Added support for comma-separated status values
- Uses SQL `IN` clause instead of single `=`
- Properly escapes parameters to prevent SQL injection

**Change 2: Future Appointments Filter**
- Added `AND a.start_time >= CURDATE()` when no specific date is requested
- Ensures only current and future appointments are shown

#### File 2: `app/therapist/dashboard/page.tsx`

**Change 1: Enhanced Logging**
```typescript
console.log('Fetching upcoming appointments for therapist:', therapist.therapist_id);
console.log('Upcoming appointments response:', data);
console.log('Filtered upcoming appointments:', futureAppointments);
```

**Change 2: Client-Side Filtering**
```typescript
const futureAppointments = (data.appointments || [])
  .filter((apt: Appointment) => new Date(apt.start_time) > now)
  .slice(0, 5);
```

**Change 3: Added 'scheduled' Status**
```typescript
status=confirmed,pending,scheduled
```

### Testing

#### 1. Check Console Logs
Open browser DevTools → Console tab and look for:
```
Fetching upcoming appointments for therapist: 123
Upcoming appointments response: { success: true, appointments: [...] }
Filtered upcoming appointments: [...]
```

#### 2. Check API Response
Visit: `http://localhost:3000/api/therapists/YOUR_ID/appointments?status=confirmed,pending,scheduled`

Expected response:
```json
{
  "success": true,
  "appointments": [
    {
      "appointment_id": 1,
      "user_name": "John Doe",
      "start_time": "2025-10-20 10:00:00",
      "status": "confirmed",
      ...
    }
  ]
}
```

#### 3. Test Different Scenarios

**Scenario 1: Has Future Appointments**
- Create appointments with future dates
- Check if they appear on dashboard
- Verify only next 5 are shown

**Scenario 2: All Past Appointments**
- Should show "No upcoming appointments" message

**Scenario 3: Multiple Status Types**
- Create appointments with different statuses: confirmed, pending, scheduled
- All should appear in upcoming list

#### 4. SQL Test Query
```sql
-- Check what appointments exist
SELECT 
  appointment_id,
  user_id,
  therapist_id,
  start_time,
  status
FROM appointments
WHERE therapist_id = YOUR_THERAPIST_ID
  AND start_time >= CURDATE()
  AND status IN ('confirmed', 'pending', 'scheduled')
ORDER BY start_time ASC;
```

### Appointment Status Flow

#### Valid Status Values:
1. **pending** - Appointment requested, awaiting confirmation
2. **confirmed** - Appointment confirmed by therapist
3. **scheduled** - Appointment scheduled and ready
4. **completed** - Session finished
5. **cancelled** - Appointment cancelled

#### Dashboard Shows:
- ✅ pending
- ✅ confirmed  
- ✅ scheduled
- ❌ completed (past)
- ❌ cancelled

### Common Issues & Solutions

#### Issue: Still No Appointments Showing

**Check 1: Do appointments exist?**
```sql
SELECT * FROM appointments 
WHERE therapist_id = YOUR_ID 
AND start_time >= CURDATE();
```

**Check 2: Is therapist_id correct?**
```javascript
// In browser console:
localStorage.getItem('therapist') // or
localStorage.getItem('user')
```

**Check 3: Check appointment status**
```sql
SELECT DISTINCT status FROM appointments;
```
Make sure appointments have one of: confirmed, pending, scheduled

**Check 4: Check date format**
```sql
-- Appointments should be in future
SELECT 
  appointment_id,
  start_time,
  NOW() as current_time,
  start_time > NOW() as is_future
FROM appointments
WHERE therapist_id = YOUR_ID;
```

#### Issue: Console Shows Empty Array

**Possible Causes:**
1. No appointments in database
2. All appointments are in the past
3. Appointments have wrong status (e.g., 'paid', 'booking')
4. Wrong therapist_id

**Solution:**
Create a test appointment:
```sql
INSERT INTO appointments (
  user_id, therapist_id, start_time, end_time, status
) VALUES (
  1, YOUR_THERAPIST_ID, 
  DATE_ADD(NOW(), INTERVAL 1 DAY), 
  DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 1 HOUR,
  'confirmed'
);
```

#### Issue: Shows Past Appointments

**Cause:** Client-side filtering not working

**Check:** Look at the filtered appointments log:
```javascript
Filtered upcoming appointments: [...]
```

If empty, appointments might be too far in past

### Performance Considerations

#### Query Optimization
The API now:
- ✅ Filters at database level (more efficient)
- ✅ Uses indexed columns (therapist_id, start_time)
- ✅ Limits results with client-side slice(0, 5)

#### Caching
Consider adding:
```typescript
// Refresh every 5 minutes
useEffect(() => {
  fetchUpcomingAppointments();
  const interval = setInterval(fetchUpcomingAppointments, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, [therapist]);
```

---

## Files Modified Summary

### Fix #1 (Status Field Error)
- ✅ `/app/therapist/sessions/page.tsx` - Added fallback logic for status field

### Fix #2 (Upcoming Appointments)
- ✅ `app/api/therapists/[id]/appointments/route.ts` - Multiple status support + future filter
- ✅ `app/therapist/dashboard/page.tsx` - Enhanced logging + client-side filtering

---

## Expected Results

### After Fix #1:
- ✅ No more "undefined is not an object" errors
- ✅ Status badges display correctly with fallback values
- ✅ Session filtering works even with missing status fields

### After Fix #2:
- ✅ Upcoming appointments section shows next 5 appointments
- ✅ Only future appointments are displayed
- ✅ Confirmed, pending, and scheduled statuses all appear
- ✅ Sorted by start_time (earliest first)
- ✅ Shows user name, date, time, and status
- ✅ "No upcoming appointments" if none exist

---

## Verification Steps

1. ✅ Open therapist dashboard
2. ✅ Check browser console for logs
3. ✅ See "Upcoming Sessions" section
4. ✅ Verify appointments are in the future
5. ✅ Click "View All" to see full list
6. ✅ Go to Sessions page and verify status badges work
7. ✅ Test filtering by status in Sessions page

---

**Status:** ✅ Both issues fixed and ready for testing!
