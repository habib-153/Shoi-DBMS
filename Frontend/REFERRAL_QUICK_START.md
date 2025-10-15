# Patient Referral System - Quick Start Guide

## 🎯 What Was Built

A complete system for psychologists to refer patients to psychiatrists when they determine the condition is severe and requires specialized psychiatric care.

## 📦 Files Created

### Database
- `database_referral_setup.sql` - Complete database setup script

### API Endpoints (7 new routes)
1. `/app/api/referrals/route.ts` - Create and list referrals
2. `/app/api/referrals/[id]/route.ts` - Get, update, delete referral
3. `/app/api/therapists/[id]/referrals/route.ts` - Therapist's sent/received referrals
4. `/app/api/users/[id]/referrals/route.ts` - Patient's referrals
5. `/app/api/psychiatrists/route.ts` - List available psychiatrists

### UI Pages
1. `/app/therapist/sessions/page.tsx` - **UPDATED** with referral button
2. `/app/therapist/referrals/page.tsx` - **NEW** referrals dashboard

### Documentation
1. `REFERRAL_SYSTEM_DOCUMENTATION.md` - Complete system documentation
2. `REFERRAL_SYSTEM_IMPLEMENTATION.md` - Implementation guide

## 🚀 How to Use

### Step 1: Run Database Setup
```sql
-- In MySQL/phpMyAdmin, run:
USE shoi;
SOURCE database_referral_setup.sql;

-- Mark therapists as psychiatrists
UPDATE therapists SET specialization = 'psychiatrist' WHERE therapist_id IN (1, 2, 3);
```

### Step 2: Test as Psychologist
1. Login as a therapist/psychologist
2. Go to `/therapist/sessions`
3. Click "Add Note" or "Edit Note" on any session
4. Click the **orange "Refer to Psychiatrist"** button at bottom left
5. Fill out the form:
   - Select severity: Moderate, Severe, or Critical
   - Enter reason (required)
   - Add symptoms, medication, notes
6. Click "Submit Referral"
7. Success! Referral created

### Step 3: Test as Psychiatrist
1. Login as a psychiatrist
2. Go to `/therapist/referrals`
3. Click "Referrals Received" tab
4. View pending referrals
5. Click expand arrow to see details
6. Click "Accept Referral" or "Reject"
7. Add optional response message
8. Done!

## 🎨 UI Features

### In Session Notes Modal
- **New Button**: "Refer to Psychiatrist" (orange, left side of footer)
- Opens comprehensive referral form
- Color-coded severity selection
- All fields with helpful placeholders

### Referrals Dashboard (`/therapist/referrals`)
- **Two Tabs**: "Referrals Sent" and "Referrals Received"
- **Statistics**: Pending, Accepted, Completed, Rejected, Critical counts
- **Status Badges**: Color-coded (Pending=Blue, Accepted=Green, etc.)
- **Severity Badges**: Color-coded (Critical=Red, Severe=Orange, Moderate=Yellow)
- **Expandable Cards**: Click to see full details
- **Action Buttons**: Accept/Reject for received referrals

## 📊 Data Flow

```
Psychologist sees patient → Determines severity → Creates referral
                                                          ↓
                          Referral stored in database with status='pending'
                                                          ↓
                          Psychiatrist receives referral → Reviews details
                                                          ↓
                            Accepts ← Decision? → Rejects
                                ↓                    ↓
                        Status='accepted'      Status='rejected'
                                ↓
                    Patient added to psychiatrist's care
```

## 🔑 Key Features

### For Psychologists
✅ One-click referral from session notes  
✅ Severity level selection (visual)  
✅ Comprehensive patient information form  
✅ Track all sent referrals  
✅ See acceptance/rejection status  

### For Psychiatrists
✅ View all incoming referrals  
✅ Filter by status and severity  
✅ Quick statistics dashboard  
✅ Accept/reject with notes  
✅ Full patient information access  

### Security
✅ Therapist validation  
✅ Session ownership checks  
✅ Patient data privacy  
✅ Complete audit trail  

## 🎯 Current Status

### ✅ Completed
- [x] Database tables created
- [x] All API endpoints working
- [x] Referral form in session notes
- [x] Referrals dashboard for therapists
- [x] Accept/reject functionality
- [x] Status tracking
- [x] Statistics display
- [x] Complete documentation

### ⏳ Future Enhancements
- [ ] Email/SMS notifications
- [ ] Patient portal to view referrals
- [ ] Auto-match psychiatrists
- [ ] Referral analytics
- [ ] Appointment booking integration

## 📝 Quick Reference

### API Examples

**Create Referral:**
```javascript
POST /api/referrals
{
  "user_id": 123,
  "referring_therapist_id": 202,
  "session_id": 403,
  "reason": "Severe symptoms requiring psychiatric care",
  "severity_level": "severe"
}
```

**Accept Referral:**
```javascript
PATCH /api/referrals/5
{
  "status": "accepted",
  "referred_to_therapist_id": 45,
  "response_notes": "Will contact patient"
}
```

### Database Tables
- `referrals` - Main referral data
- `referral_comments` - Communication between therapists
- `therapists.specialization` - New field to mark psychiatrists

## 🎉 Success!

The referral system is now fully functional! Psychologists can refer patients to psychiatrists with just a few clicks, and psychiatrists can easily manage incoming referrals.

**Next**: Run the database setup and test the system!
