# QUICK FIX: Database Schema Mismatch Error

## The Problem
When registering as psychologist/psychiatrist, you see: **"Database schema mismatch"**

This means the `specialization` column is missing from your `therapists` table.

---

## ✅ Solution (Choose ONE method)

### Method 1: Direct SQL (Recommended - 30 seconds)

1. **Open MySQL Workbench** or any MySQL client
2. **Connect to your database**
3. **Copy and paste this SQL:**

```sql
USE shoi;

ALTER TABLE therapists 
ADD COLUMN specialization ENUM('psychologist', 'psychiatrist', 'counselor', 'therapist') 
DEFAULT 'therapist';
```

4. **Click Execute** (⚡ icon or press Ctrl+Enter)
5. **Done!** Try registering again

---

### Method 2: Use the SQL File

1. **Find the file:** `add_specialization_simple.sql` (in your Frontend folder)
2. **Open MySQL Workbench**
3. **File → Open SQL Script** → Select `add_specialization_simple.sql`
4. **Execute** (⚡ icon)
5. **Done!**

---

### Method 3: Command Line (If you prefer terminal)

```bash
# Windows PowerShell:
Get-Content add_specialization_simple.sql | mysql -u root -p shoi

# Or if you have mysql in PATH:
mysql -u root -p shoi < add_specialization_simple.sql
```

---

## ✅ Verify It Worked

Run this in MySQL:
```sql
USE shoi;
DESCRIBE therapists;
```

**Look for:** A row with `specialization` in the Field column  
**Type should be:** `enum('psychologist','psychiatrist','counselor','therapist')`

---

## 🎯 Now Try Registering Again

1. Go to **http://localhost:3000/register**
2. Click **"Specialist"** tab
3. Select **"Psychologist"**
4. Fill in all fields:
   - Name
   - Email  
   - Password
   - University
   - Certificate link
5. Click **"Complete the Registration"**

**Expected:** ✅ "Successfully Registered!" message

---

## 🔧 Alternative: API Works Without Column (Temporary)

If you can't add the column right now, the latest API update will:
- ✅ Create the therapist WITHOUT the specialization column
- ⚠️ Show a warning message
- ⚠️ Referral system won't work until you add the column

But you can register and it will work!

---

## Still Getting Errors?

### Check your terminal where `npm run dev` is running:
Look for messages like:
```
Specialization column does not exist, inserting without it...
Therapist created successfully (without specialization): 123
```

This means registration worked, but you should add the column for full functionality.

---

## Why This Happened

The referral system requires knowing if a therapist is a:
- 🧠 **Psychologist** (can refer patients)
- 💊 **Psychiatrist** (can receive referrals)
- 🗣️ **Counselor** / **Therapist** (general)

The `specialization` column stores this information.

---

## Need Help?

**Error persists?** Check:
1. Is MySQL running?
2. Can you connect to the database?
3. Is the table name exactly `therapists`?
4. Try: `SHOW TABLES;` to verify

**Still stuck?** Check the server logs in your terminal for detailed error messages.
