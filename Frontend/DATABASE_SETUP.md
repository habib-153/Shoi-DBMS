# Database Setup Guide

This guide will help you fix the "Failed to fetch therapists" error.

## Prerequisites

1. **Install MySQL** (if not already installed)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP which includes MySQL

2. **Verify MySQL is Running**
   ```powershell
   # Check if MySQL service is running
   Get-Service -Name MySQL*
   ```

## Setup Steps

### 1. Create Environment File

Create a file named `.env.local` in the `Frontend` directory with:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=shoi
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Replace `your_password_here` with your MySQL root password (leave empty if no password).

### 2. Create Database

Open MySQL command line or phpMyAdmin and run:

```sql
CREATE DATABASE IF NOT EXISTS shoi;
USE shoi;

-- Create therapists table
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

-- Create specialties table
CREATE TABLE IF NOT EXISTS specialties (
  specialty_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create therapist_specialties junction table
CREATE TABLE IF NOT EXISTS therapist_specialties (
  therapist_id INT,
  specialty_id INT,
  PRIMARY KEY (therapist_id, specialty_id),
  FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id) ON DELETE CASCADE,
  FOREIGN KEY (specialty_id) REFERENCES specialties(specialty_id) ON DELETE CASCADE
);

-- Insert sample specialties
INSERT INTO specialties (name, description) VALUES
('Anxiety Disorders', 'Treatment for anxiety, panic attacks, and phobias'),
('Depression', 'Support for depression and mood disorders'),
('Child Psychology', 'Specialized care for children and adolescents'),
('Couples Therapy', 'Relationship counseling and family therapy'),
('Trauma Recovery', 'PTSD and trauma-focused therapy'),
('Addiction Recovery', 'Substance abuse and addiction treatment');

-- Insert sample therapist
INSERT INTO therapists (name, email, phone, qualifications, experience_years, bio, location, consultation_fee) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@example.com', '+880-1234-567890', 'PhD in Clinical Psychology', 10, 
'Experienced clinical psychologist specializing in cognitive behavioral therapy and trauma recovery.', 
'Dhaka, Bangladesh', 2500);

-- Link therapist to specialties
INSERT INTO therapist_specialties (therapist_id, specialty_id) 
SELECT 1, specialty_id FROM specialties WHERE name IN ('Anxiety Disorders', 'Trauma Recovery');
```

### 3. Test Database Connection

Open PowerShell in the Frontend directory and run:

```powershell
# Install MySQL client if not installed
npm install mysql2

# Start the development server
npm run dev
```

### 4. Verify Setup

1. Open browser to http://localhost:3000/experts
2. You should now see the therapists page without errors
3. Check the terminal for database connection logs

## Troubleshooting

### Error: "Database configuration missing"
- Ensure `.env.local` file exists in the `Frontend` directory
- Restart the dev server after creating `.env.local`

### Error: "Database connection failed"
- Check if MySQL service is running
- Verify credentials in `.env.local`
- Test connection using MySQL Workbench or command line

### Error: "Database query failed"
- Ensure all tables are created (run the SQL script above)
- Check table names match exactly (case-sensitive on some systems)

### Still Having Issues?
- Check browser console (F12) for detailed error messages
- Check the terminal running `npm run dev` for server logs
- Verify MySQL is running on port 3306 (default)

## Quick Test SQL

Run this to verify everything is set up:

```sql
USE shoi;
SHOW TABLES;
SELECT COUNT(*) FROM therapists;
SELECT COUNT(*) FROM specialties;
SELECT COUNT(*) FROM therapist_specialties;
```

All queries should return without errors and show data exists.
