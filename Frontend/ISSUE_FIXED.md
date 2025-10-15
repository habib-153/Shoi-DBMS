# 🎯 ISSUE FIXED: Psychiatrist List Not Showing

## Problem
The error "Failed to fetch psychiatrists" was occurring because:
1. **Your `therapists` table does NOT have a `specialization` column** - only `Interested_field`
2. **All therapists have `Interested_field = NULL`** - no one is marked as a psychiatrist

## What I Fixed

### 1. Updated API (`/app/api/psychiatrists/route.ts`)
**Before:** 
- Tried to query the non-existent `specialization` column
- Tried to select columns that don't exist (`phone`, `qualifications`, `location`)

**After:**
- Queries only existing columns: `therapist_id`, `name`, `email`, `gender`, `license_no`, `years_experience`, `rating`, `bio`, `educational_info`, `fees_min`, `fees_max`, `languages`, `Interested_field`, `image`
- Filters using: `WHERE LOWER(t.Interested_field) LIKE '%psychiatr%'`
- Works with your actual table structure

### 2. Created Quick Fix SQL
File: `QUICK_FIX.sql` - Run this to:
- Mark therapist ID 22 (Fayaz Noman) as a Psychiatrist
- Create the notifications table
- Verify everything is set up

## ✅ Solution: Run This SQL

Open MySQL and run **`QUICK_FIX.sql`** or copy this:

```sql
-- Mark a therapist as psychiatrist
UPDATE therapists 
SET Interested_field = 'Psychiatrist'
WHERE therapist_id = 22;

-- Verify
SELECT therapist_id, name, Interested_field 
FROM therapists 
WHERE Interested_field LIKE '%Psychiatr%';

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_type ENUM('user', 'therapist') NOT NULL,
  recipient_id INT NOT NULL,
  sender_type ENUM('user', 'therapist', 'system') DEFAULT 'system',
  sender_id INT NULL,
  notification_type ENUM('referral', 'appointment', 'message', 'session_note', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_id INT NULL,
  action_url VARCHAR(500) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  INDEX idx_recipient (recipient_type, recipient_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);
```

## 🧪 Test It

After running the SQL:

1. **Test API directly:**
   ```
   http://localhost:3000/api/psychiatrists
   ```
   Should return: `{"success":true,"psychiatrists":[{...}],"count":1}`

2. **Test in UI:**
   - Login as psychologist
   - Go to `/therapist/sessions`
   - Click on a session
   - Click "Refer to Psychiatrist"
   - Dropdown should now show "Fayaz Noman"

3. **Test notification:**
   - Create a referral
   - Login as therapist ID 22 (Fayaz Noman)
   - Check the bell icon 🔔 - should show a notification!

## 📊 Your Database Structure

I discovered your `therapists` table has these columns:
- `therapist_id`, `name`, `email`, `license_no`
- `years_experience`, `gender`
- `fees_min`, `fees_max`
- `bio`, `languages`, `rating`
- `password_hash`
- `Interested_field` (not `specialization`!)
- `educational_info`, `image`

## 🎉 Summary

**The API is now fixed** and matches your actual database structure. Just run the SQL to mark at least one therapist as a psychiatrist, and everything will work!

Need to mark more psychiatrists? Just repeat:
```sql
UPDATE therapists SET Interested_field = 'Psychiatrist' WHERE therapist_id IN (23, 24, 25);
```
