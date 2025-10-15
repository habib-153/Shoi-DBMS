# Therapist Registration Troubleshooting Guide

**Issue:** "Failed to add therapist" when registering as psychologist or psychiatrist

## Step-by-Step Fix

### Step 1: Add the Missing Column

The `specialization` column is required but might be missing from your database.

**Option A - Automatic Fix (Easiest):**
1. Open your browser
2. Go to: `http://localhost:3000/api/fix-therapist-schema`
3. You should see a success message
4. Try registering again

**Option B - Manual SQL:**
```sql
USE shoi;

ALTER TABLE therapists 
ADD COLUMN IF NOT EXISTS specialization 
ENUM('psychologist', 'psychiatrist', 'counselor', 'therapist') 
DEFAULT 'therapist' 
AFTER phone;
```

### Step 2: Verify the Column Exists

Check if the column was added:
```sql
USE shoi;
DESCRIBE therapists;
```

You should see a `specialization` column with type `enum('psychologist','psychiatrist','counselor','therapist')`.

### Step 3: Test Registration

1. Go to `/register`
2. Select **Specialist** tab
3. Choose **Psychologist**
4. Fill in:
   - Name
   - Email
   - Password
   - University name
   - Certificate link (Google Drive)
5. Click "Complete the Registration"

**Expected Result:** Success message and redirect to login

### Step 4: Verify in Database

Check if the therapist was created:
```sql
USE shoi;
SELECT therapist_id, name, email, specialization 
FROM therapists 
ORDER BY created_at DESC 
LIMIT 5;
```

## Common Errors and Solutions

### Error: "Unknown column 'specialization'"
**Solution:** Run Step 1 above to add the column

### Error: "Email already exists"
**Cause:** You already registered with this email
**Solution:** Use a different email or delete the existing record:
```sql
DELETE FROM therapists WHERE email = 'your-email@example.com';
```

### Error: "Name and email are required"
**Cause:** Form validation failed
**Solution:** Make sure all required fields are filled

### Error: "Database connection failed"
**Cause:** MySQL is not running
**Solution:** 
1. Start MySQL service
2. Check `.env.local` file has correct credentials

## Debugging Steps

### 1. Check Browser Console
Open Developer Tools (F12) and look for errors in the Console tab.

### 2. Check Server Logs
Look at your terminal running `npm run dev` for error messages.

### 3. Check Network Tab
In Developer Tools > Network tab:
- Find the POST request to `/api/therapists`
- Click on it
- Check the "Response" tab for error details
- Check the "Payload" tab to see what data was sent

### 4. Test the API Directly
Open `http://localhost:3000/api/therapists` in your browser to see if it returns data.

## Database Schema Reference

### Required therapists table columns:
```sql
CREATE TABLE therapists (
  therapist_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  specialization ENUM('psychologist', 'psychiatrist', 'counselor', 'therapist') DEFAULT 'therapist',
  qualifications TEXT,
  experience_years INT DEFAULT 0,
  bio TEXT,
  location VARCHAR(255),
  consultation_fee INT DEFAULT 2000,
  languages VARCHAR(255) DEFAULT 'English, Bengali',
  rating DECIMAL(3,2) DEFAULT 4.5,
  profile_picture VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Registration Data Flow

### 1. Frontend Submits:
```json
{
  "name": "Dr. John Doe",
  "email": "john@example.com",
  "password": "password123",
  "university": "Harvard University",
  "certificate": "https://drive.google.com/...",
  "interested": "Depression, Anxiety"
}
```

### 2. API Processes:
- Detects `university` without `license_no` → Sets specialization to "psychologist"
- Stores university info in `bio` field
- Uses certificate as reference
- Inserts into database

### 3. Database Stores:
```sql
INSERT INTO therapists (name, email, phone, qualifications, specialization, bio, ...)
VALUES ('Dr. John Doe', 'john@example.com', NULL, NULL, 'psychologist', 'Education: Harvard...', ...);
```

## Still Having Issues?

### Check these files:
1. **app/api/therapists/route.ts** - API endpoint
2. **app/register/page.tsx** - Registration form
3. **.env.local** - Database credentials

### Get detailed error:
Add logging to see the exact error:
```javascript
// In app/register/page.tsx, in the submit function
console.log('Payload:', payload);
console.log('Response:', data);
console.log('Error details:', data.details);
```

### Contact Support
If you still get errors, provide:
1. Error message from browser console
2. Error message from server terminal
3. Response from `/api/fix-therapist-schema`
4. Output of `DESCRIBE therapists;` from MySQL

## Success Indicators

✅ No error message appears  
✅ "Successfully Registered!" toast shows  
✅ Redirected to `/login` page  
✅ Can see therapist in database with `specialization = 'psychologist'`  
✅ Therapist can log in and access dashboard
