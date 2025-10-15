# Error Fix Summary: "Failed to fetch therapists"

## What Was Done

I've improved error handling and diagnostics for the therapists fetching error. Here's what was changed:

## Changes Made

### 1. Enhanced API Error Handling (`app/api/therapists/route.ts`)
- Added check for missing environment variables
- Better error messages for connection failures
- Improved query error handling with detailed messages
- Each error now returns specific details to help diagnose the issue

### 2. Improved Frontend Error Display (`app/experts/page.tsx`)
- Better error message parsing from API
- Empty data handling
- Enhanced error UI with helpful troubleshooting tips
- More detailed error messages in console

### 3. Created Setup Documentation
- `DATABASE_SETUP.md` - Complete database setup guide
- `.env.local.example` - Example environment configuration

## How to Fix the Error

### Step 1: Check if MySQL is Running

Open PowerShell and run:
```powershell
Get-Service -Name MySQL*
```

If not running, start it:
```powershell
Start-Service -Name MySQL80  # Or your MySQL service name
```

### Step 2: Create .env.local File

Create a file `.env.local` in the `Frontend` directory:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=shoi
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Important:** Replace `your_mysql_password` with your actual MySQL password (or leave empty if no password).

### Step 3: Test Database Connection

Visit: http://localhost:3000/api/test-db-connection

This will show you:
- If database tables exist
- Table counts
- Any connection issues

### Step 4: Create Database Tables (if needed)

If tables don't exist, run this SQL in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS shoi;
USE shoi;

CREATE TABLE IF NOT EXISTS therapists (
  therapist_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  qualifications TEXT,
  experience_years INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 4.5,
  bio TEXT,
  profile_picture VARCHAR(255),
  location VARCHAR(255),
  consultation_fee INT DEFAULT 2000,
  languages VARCHAR(255) DEFAULT 'English, Bengali',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS specialties (
  specialty_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS therapist_specialties (
  therapist_id INT,
  specialty_id INT,
  PRIMARY KEY (therapist_id, specialty_id),
  FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id) ON DELETE CASCADE,
  FOREIGN KEY (specialty_id) REFERENCES specialties(specialty_id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO specialties (name, description) VALUES
('Anxiety Disorders', 'Treatment for anxiety, panic attacks, and phobias'),
('Depression', 'Support for depression and mood disorders'),
('Child Psychology', 'Specialized care for children and adolescents');

INSERT INTO therapists (name, email, qualifications, experience_years, bio) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@example.com', 'PhD in Clinical Psychology', 10, 
'Experienced clinical psychologist specializing in cognitive behavioral therapy.');

INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (1, 1), (1, 2);
```

### Step 5: Restart Development Server

```powershell
# Stop the server (Ctrl+C in the terminal)
# Then restart it
npm run dev
```

### Step 6: Test the Experts Page

Visit: http://localhost:3000/experts

You should now see therapists without errors!

## Diagnostic Steps

If still having issues, check these in order:

1. **Browser Console (F12)**
   - Look for detailed error messages
   - Check network tab for API response

2. **Terminal Output**
   - Look for database connection logs
   - Check for SQL errors

3. **Test Endpoints**
   - `/api/test-db-connection` - Database health
   - `/api/therapists` - Direct API test

4. **Common Issues**
   - **ECONNREFUSED**: MySQL not running
   - **ER_ACCESS_DENIED**: Wrong credentials in .env.local
   - **ER_NO_SUCH_TABLE**: Tables not created
   - **Database configuration missing**: .env.local doesn't exist

## Quick Verification Checklist

- [ ] MySQL service is running
- [ ] `.env.local` file exists with correct credentials
- [ ] Database `shoi` exists
- [ ] Tables `therapists`, `specialties`, `therapist_specialties` exist
- [ ] At least one therapist record exists
- [ ] Dev server restarted after creating `.env.local`

## Still Need Help?

Check the detailed `DATABASE_SETUP.md` file for more comprehensive instructions and troubleshooting steps.
