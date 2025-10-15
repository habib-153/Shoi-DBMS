# TROUBLESHOOTING: Upcoming Appointments Not Showing

## Steps to Debug

### Step 1: Check Browser Console
1. Open your therapist dashboard: `http://localhost:3000/therapist/dashboard`
2. Open DevTools: Press **F12**
3. Go to **Console** tab
4. Look for logs starting with `=== UPCOMING APPOINTMENTS DEBUG ===`

### Step 2: What to Look For in Console

#### Check 1: Is therapist_id present?
```
Therapist object: { therapist_id: 123, name: "...", ... }
Therapist ID: 123
```
✅ **If you see a number** - Good! Go to Check 2
❌ **If you see "No therapist_id found!"** - Go to Fix #1 below

#### Check 2: Does the API return data?
```
Full API response: {
  "success": true,
  "appointments": [ ... ],
  "stats": { ... }
}
```
✅ **If appointments array has items** - Go to Check 3
❌ **If appointments array is empty** - Go to Fix #2 below

#### Check 3: Are appointments in the future?
```
Appointment 1: 2025-10-20 10:00:00 - Future: true
Appointment 2: 2025-10-10 10:00:00 - Future: false
```
✅ **If you see "Future: true"** - Should be working!
❌ **If all show "Future: false"** - Go to Fix #3 below

---

## Fix #1: No therapist_id Found

### Diagnose
Run in browser console:
```javascript
// Check what's in localStorage
console.log('Therapist:', localStorage.getItem('therapist'));
console.log('User:', localStorage.getItem('user'));
```

### Solution A: Re-login
1. Logout from the app
2. Login again as a therapist
3. Check console again

### Solution B: Manually set therapist data
First, find your therapist_id by visiting:
`http://localhost:3000/api/debug-therapist-info`

Then in console:
```javascript
// Replace 123 with your actual therapist_id
localStorage.setItem('therapist', JSON.stringify({
  therapist_id: 123,
  name: "Your Name",
  email: "your@email.com"
}));

// Reload page
location.reload();
```

---

## Fix #2: No Appointments in Database

### Check if appointments exist
Visit: `http://localhost:3000/api/debug-appointments`

This will show:
- All appointments in database
- Status breakdown
- Future appointments count
- Which therapists have appointments

### If no appointments exist, create test appointment

#### Option A: Using SQL
```sql
-- Replace 123 with your therapist_id and 1 with a valid user_id
INSERT INTO appointments (
  user_id, 
  therapist_id, 
  start_time, 
  end_time, 
  status,
  created_at
) VALUES (
  1,
  123,
  DATE_ADD(NOW(), INTERVAL 1 DAY),
  DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 1 HOUR,
  'confirmed',
  NOW()
);
```

#### Option B: Using API
Create a file to test appointment creation:
```javascript
fetch('/api/therapists/123/appointments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 1,
    start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 90000000).toISOString(), // Tomorrow + 1 hour
    session_type: 'consultation'
  })
}).then(r => r.json()).then(console.log);
```

---

## Fix #3: All Appointments Are in the Past

### Check appointment dates
```sql
SELECT 
  appointment_id,
  therapist_id,
  start_time,
  status,
  NOW() as current_time,
  start_time > NOW() as is_future
FROM appointments
WHERE therapist_id = 123  -- Replace with your ID
ORDER BY start_time DESC;
```

### Update existing appointments to future dates
```sql
-- Move all appointments for therapist 123 to tomorrow
UPDATE appointments
SET start_time = DATE_ADD(NOW(), INTERVAL 1 DAY),
    end_time = DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 1 HOUR
WHERE therapist_id = 123  -- Replace with your ID
  AND start_time < NOW();
```

---

## Fix #4: Wrong Status Values

### Check what statuses exist
```sql
SELECT DISTINCT status, COUNT(*) as count
FROM appointments
GROUP BY status;
```

### Valid statuses for upcoming appointments:
- ✅ `confirmed`
- ✅ `pending`
- ✅ `scheduled`
- ❌ `completed` (won't show)
- ❌ `cancelled` (won't show)
- ❌ `paid` (won't show unless you add it)

### Update appointment status
```sql
UPDATE appointments
SET status = 'confirmed'
WHERE therapist_id = 123  -- Replace with your ID
  AND status NOT IN ('confirmed', 'pending', 'scheduled');
```

---

## Complete Diagnostic Script

Run this in browser console after opening dashboard:

```javascript
(async function diagnose() {
  console.log('=== COMPLETE DIAGNOSTIC ===');
  
  // 1. Check localStorage
  const therapist = localStorage.getItem('therapist');
  const user = localStorage.getItem('user');
  console.log('1. LocalStorage Data:');
  console.log('   Therapist:', therapist);
  console.log('   User:', user);
  
  if (!therapist && !user) {
    console.error('❌ NO USER DATA IN LOCALSTORAGE - You need to login!');
    return;
  }
  
  const therapistData = JSON.parse(therapist || user);
  const therapistId = therapistData.therapist_id;
  console.log('   Therapist ID:', therapistId);
  
  if (!therapistId) {
    console.error('❌ NO THERAPIST_ID FOUND');
    return;
  }
  
  // 2. Check API
  console.log('\\n2. Checking API...');
  const url = `/api/therapists/${therapistId}/appointments?status=confirmed,pending,scheduled`;
  console.log('   URL:', url);
  
  const response = await fetch(url);
  const data = await response.json();
  
  console.log('   Response:', data);
  
  if (!data.success) {
    console.error('❌ API ERROR:', data.error);
    return;
  }
  
  // 3. Check appointments
  console.log('\\n3. Appointments Analysis:');
  console.log('   Total:', data.appointments?.length || 0);
  
  if (!data.appointments || data.appointments.length === 0) {
    console.error('❌ NO APPOINTMENTS FOUND IN DATABASE');
    console.log('   Create test appointment using SQL or API');
    return;
  }
  
  // 4. Check dates
  console.log('\\n4. Date Analysis:');
  const now = new Date();
  console.log('   Current time:', now.toISOString());
  
  data.appointments.forEach((apt, i) => {
    const aptTime = new Date(apt.start_time);
    const isFuture = aptTime > now;
    console.log(`   [${i+1}] ID ${apt.appointment_id}:`);
    console.log(`       Time: ${apt.start_time}`);
    console.log(`       Status: ${apt.status}`);
    console.log(`       User: ${apt.user_name}`);
    console.log(`       Future: ${isFuture ? '✅ YES' : '❌ NO (past)'}`);
  });
  
  const futureCount = data.appointments.filter(apt => new Date(apt.start_time) > now).length;
  console.log(`\\n   Future appointments: ${futureCount}`);
  
  if (futureCount === 0) {
    console.error('❌ ALL APPOINTMENTS ARE IN THE PAST');
    console.log('   Update appointment dates to future');
  } else {
    console.log('✅ EVERYTHING LOOKS GOOD - Appointments should be showing!');
  }
})();
```

---

## Quick Test: Create Sample Appointment

```sql
-- Run this in your MySQL console
-- Replace 123 with your therapist_id
-- Replace 1 with a valid user_id

INSERT INTO appointments (
  user_id, 
  therapist_id, 
  start_time, 
  end_time, 
  status,
  created_at
) VALUES
-- Tomorrow at 10 AM
(1, 123, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 10 HOUR, 
 DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 11 HOUR, 'confirmed', NOW()),
 
-- Day after tomorrow at 2 PM
(1, 123, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 14 HOUR, 
 DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 15 HOUR, 'pending', NOW()),
 
-- Next week at 9 AM
(1, 123, DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 9 HOUR, 
 DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 10 HOUR, 'scheduled', NOW());
```

---

## After Following Steps

1. ✅ Open dashboard: `http://localhost:3000/therapist/dashboard`
2. ✅ Check console logs
3. ✅ Run diagnostic script
4. ✅ Share the console output with me

**Tell me:**
- What does the diagnostic script show?
- Do you see any error messages?
- What is your therapist_id?
- Do appointments exist in the database?
