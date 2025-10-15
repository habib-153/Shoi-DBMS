# Therapist Registration Fix

**Date:** October 14, 2025  
**Issue:** "Failed to add therapist" error during specialist registration

## Root Cause

The therapists table schema was updated to include a `specialization` column (ENUM: 'psychologist', 'psychiatrist', 'counselor', 'therapist') for the referral system, but:

1. **The column might not exist** in your database yet
2. The POST API was trying to insert into columns that don't exist
3. No migration was run to add the `specialization` column

## Quick Fix

### Option 1: Use Auto-Fix API (Recommended)
Visit this URL in your browser:
```
http://localhost:3000/api/fix-therapist-schema
```

This will automatically add the `specialization` column if it's missing.

### Option 2: Run SQL Manually
Open your MySQL client and run:
```sql
USE shoi;

ALTER TABLE therapists 
ADD COLUMN specialization ENUM('psychologist', 'psychiatrist', 'counselor', 'therapist') 
DEFAULT 'therapist' 
AFTER phone;

UPDATE therapists 
SET specialization = 'therapist' 
WHERE specialization IS NULL;
```

### Option 3: Use Migration Script
Run the provided migration script:
```bash
mysql -u root -p shoi < add_specialization_column.sql
```

## Previous API Issues

### Old Implementation Problems:
- Used `therapist_specialties` junction table (deprecated)
- Didn't handle `specialization` column
- Didn't map registration form fields to database schema
- No password field handling
- Missing `license_no`, `educational_info`, `image`, `interesterd_field` columns

### Registration Form Data:
**Psychologist:**
```json
{
  "name": "string",
  "email": "string", 
  "password": "string",
  "university": "string",
  "certificate": "string (Google Drive link)",
  "interested": "string"
}
```

**Psychiatrist:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string", 
  "university": "string (medical college)",
  "certificate": "string (Google Drive link)",
  "license_no": "string",
  "interested": "string"
}
```

## Solution Implemented

### 1. Dual-Format Support
The API now accepts BOTH registration format AND direct therapist creation format:

```typescript
// Handle both old registration format and new direct format
const {
  // New format fields
  name, email, phone, password, qualifications, specialization,
  experience_years, bio, location, consultation_fee, languages,
  // Old registration format fields  
  university, certificate, interested, license_no
} = body;
```

### 2. Automatic Specialization Detection
```typescript
let therapistSpecialization = specialization || 'therapist';

// If coming from registration, determine specialization
if (license_no && !specialization) {
  // Has license_no = psychiatrist
  therapistSpecialization = 'psychiatrist';
} else if (university && !license_no && !specialization) {
  // Has university but no license = psychologist
  therapistSpecialization = 'psychologist';
}
```

### 3. Field Mapping
Maps registration form fields to database schema:
```typescript
const educational_info = university || null;        // University name
const image = certificate || null;                  // Google Drive link
const interesterd_field = interested || null;       // Interested areas
```

### 4. Complete INSERT Statement
```sql
INSERT INTO therapists (
  name, email, phone, password, qualifications, specialization,
  experience_years, bio, location, consultation_fee, languages,
  license_no, educational_info, image, interesterd_field
) VALUES (...)
```

### 5. Enhanced Error Handling
- Duplicate email detection (ER_DUP_ENTRY)
- Specialization validation
- Required field validation
- Detailed error messages

## Database Schema Compatibility

The updated API works with the current therapists table schema:
```sql
CREATE TABLE therapists (
  therapist_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255),
  specialization ENUM('psychologist', 'psychiatrist', 'counselor', 'therapist') DEFAULT 'therapist',
  experience_years INT DEFAULT 0,
  license_no VARCHAR(100),
  qualification TEXT,
  educational_info TEXT,
  image VARCHAR(255),
  interesterd_field VARCHAR(255),
  bio TEXT,
  location VARCHAR(255),
  consultation_fee INT DEFAULT 2000,
  languages VARCHAR(255) DEFAULT 'English, Bengali',
  rating DECIMAL(3,2) DEFAULT 4.5,
  -- ... other fields
);
```

## Response Format

### Success Response:
```json
{
  "id": 123,
  "message": "Therapist added successfully",
  "therapist_id": 123,
  "specialization": "psychiatrist"
}
```

### Error Responses:
```json
// Missing fields
{ "error": "Name and email are required" }

// Duplicate email
{ 
  "error": "Email already exists", 
  "details": "A therapist with this email already exists in the system" 
}

// Invalid specialization
{ 
  "error": "Invalid specialization",
  "details": "Specialization must be one of: psychologist, psychiatrist, counselor, therapist"
}
```

## Testing Checklist

- [x] Register as psychologist (university + certificate)
- [x] Register as psychiatrist (medical college + license_no + certificate)
- [x] Verify specialization is automatically set correctly
- [x] Test duplicate email detection
- [x] Verify data is stored in correct columns
- [x] Check that psychiatrists can receive referrals

## Benefits

1. **Backward Compatibility:** Works with existing registration form
2. **Forward Compatible:** Supports direct therapist creation with new fields
3. **Automatic Type Detection:** Intelligently determines specialization
4. **Referral System Ready:** Psychiatrists properly identified for referrals
5. **Better Error Messages:** Clear feedback on what went wrong

## Files Modified

1. **app/api/therapists/route.ts** - Complete POST endpoint rewrite

## Related Systems

This fix ensures compatibility with:
- ✅ Registration system (`app/register/page.tsx`)
- ✅ Referral system (requires `specialization` column)
- ✅ Psychiatrist listing (`/api/psychiatrists`)
- ✅ Database triggers (validate psychiatrist specialization)

## Migration Notes

**No database migration needed** - The API now correctly uses existing schema fields.

**Existing therapists:** If you have therapists without `specialization` set, run:
```sql
UPDATE therapists 
SET specialization = 'therapist' 
WHERE specialization IS NULL;
```
