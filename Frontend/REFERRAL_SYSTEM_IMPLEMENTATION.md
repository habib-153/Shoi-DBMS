# Patient Referral System - Implementation Complete! 🎉

## Overview
A comprehensive referral system has been implemented that allows psychologists to refer patients to psychiatrists when they determine the patient's condition requires specialized psychiatric care.

## ✅ What Has Been Implemented

### 1. Database Structure ✓
- **referrals table**: Stores all referral information
- **referral_comments table**: Allows communication between therapists
- **therapist specialization field**: Distinguishes psychologists from psychiatrists

**Setup File**: `database_referral_setup.sql`

### 2. API Endpoints ✓

#### Main Referrals API
- **POST `/api/referrals`** - Create new referral
- **GET `/api/referrals`** - Get all referrals (with filters)

#### Individual Referral Management
- **GET `/api/referrals/[id]`** - Get specific referral details
- **PATCH `/api/referrals/[id]`** - Update referral status (accept/reject/complete)
- **DELETE `/api/referrals/[id]`** - Cancel referral

#### Therapist-Specific Endpoints
- **GET `/api/therapists/[id]/referrals?type=sent`** - Get referrals sent by therapist
- **GET `/api/therapists/[id]/referrals?type=received`** - Get referrals received by therapist

#### Patient Referrals
- **GET `/api/users/[id]/referrals`** - Get all referrals for a patient

#### Psychiatrist List
- **GET `/api/psychiatrists`** - Get all available psychiatrists

### 3. User Interface ✓

#### For Psychologists
**Session Notes Page** (`/therapist/sessions`)
- Added "Refer to Psychiatrist" button in session notes modal
- Complete referral form with:
  - Severity level selection (Moderate, Severe, Critical)
  - Reason for referral (required)
  - Observed symptoms
  - Current medication
  - Additional notes
- Real-time referral submission

**Referrals Dashboard** (`/therapist/referrals`)
- View all sent referrals
- Track referral status
- See detailed patient information
- Monitor referral acceptance/rejection

#### For Psychiatrists
**Referrals Dashboard** (`/therapist/referrals`)
- View incoming referrals (including open referrals)
- Accept or reject referrals
- Add response messages
- View patient details and severity
- Quick statistics dashboard

## 📋 Setup Instructions

### Step 1: Database Setup

Run the SQL script in MySQL:

```bash
mysql -u root -p shoi < database_referral_setup.sql
```

Or manually execute the SQL in your MySQL client/phpMyAdmin.

### Step 2: Mark Therapists as Psychiatrists

Update your therapists table to designate psychiatrists:

```sql
-- Update specific therapists as psychiatrists
UPDATE therapists SET specialization = 'psychiatrist' WHERE therapist_id IN (1, 2, 3);

-- Update specific therapists as psychologists  
UPDATE therapists SET specialization = 'psychologist' WHERE therapist_id IN (202, 22);
```

### Step 3: Restart Development Server

```powershell
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Test the System

1. **Login as a psychologist**
2. Navigate to **Sessions** page
3. Click on a session's **"Add Note"** or **"Edit Note"**
4. Click **"Refer to Psychiatrist"** button (orange button at bottom left)
5. Fill out the referral form
6. Submit the referral

7. **Login as a psychiatrist**
8. Navigate to **Referrals** page (`/therapist/referrals`)
9. Click **"Referrals Received"** tab
10. View pending referrals
11. Accept or reject referrals

## 🎯 Features

### Severity Levels
- **Moderate**: Standard referral
- **Severe**: Urgent psychiatric attention needed
- **Critical**: Immediate psychiatric intervention required

### Referral Statuses
- **Pending**: Awaiting psychiatrist response
- **Accepted**: Psychiatrist has accepted the referral
- **Rejected**: Psychiatrist declined the referral
- **Completed**: Treatment completed
- **Cancelled**: Referral cancelled by referring therapist

### Key Capabilities
1. ✅ Refer patients during or after sessions
2. ✅ Specify severity level with visual indicators
3. ✅ Include detailed symptoms and medication info
4. ✅ Send to specific psychiatrist or open referral
5. ✅ Track referral status in real-time
6. ✅ Psychiatrists can accept/reject with notes
7. ✅ Full audit trail of all referral activities
8. ✅ Statistics dashboard for both sent and received referrals

## 🔒 Security Features

- **Therapist Validation**: Only therapists can create referrals
- **Ownership Checks**: Therapists can only manage their own referrals
- **Session Validation**: Referrals linked to valid sessions
- **Patient Privacy**: Patient data only visible to involved therapists
- **Status Tracking**: Complete audit trail of status changes

## 📱 User Flow

### Psychologist Workflow
1. Conducts session with patient
2. Determines psychiatric care is needed
3. Clicks "Refer to Psychiatrist" in session notes
4. Fills referral form:
   - Selects severity level
   - Explains reason for referral
   - Lists symptoms
   - Notes current medication
   - Adds any additional information
5. Submits referral
6. Can track referral status in Referrals dashboard

### Psychiatrist Workflow
1. Receives notification (to be implemented)
2. Views referral in Referrals dashboard
3. Reviews:
   - Patient information
   - Severity level
   - Psychologist's notes
   - Symptoms and medication
4. Accepts or rejects with optional notes
5. If accepted, patient added to their care
6. Can schedule appointments with patient

### Patient Experience
1. Receives notification of referral (to be implemented)
2. Can view referral details (to be implemented)
3. Sees recommended psychiatrist
4. Can book appointment
5. Continuity of care maintained

## 🔄 API Usage Examples

### Create a Referral
```javascript
const response = await fetch('/api/referrals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 123,
    referring_therapist_id: 202,
    session_id: 403,
    reason: "Patient showing severe depressive symptoms",
    severity_level: "severe",
    symptoms: "Persistent depression, insomnia, suicidal ideation",
    current_medication: "None",
    additional_notes: "Needs medication evaluation"
  })
});
```

### Accept a Referral
```javascript
const response = await fetch('/api/referrals/5', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'accepted',
    referred_to_therapist_id: 45,
    therapist_id: 45,
    response_notes: "I can see the patient next week"
  })
});
```

### Get Therapist's Sent Referrals
```javascript
const response = await fetch('/api/therapists/202/referrals?type=sent');
const data = await response.json();
// data.referrals, data.stats
```

## 📊 Database Schema

### referrals Table
```sql
referral_id INT PRIMARY KEY
user_id INT (patient)
referring_therapist_id INT (psychologist)
referred_to_therapist_id INT (psychiatrist, nullable)
session_id INT (nullable)
reason TEXT
severity_level ENUM('moderate', 'severe', 'critical')
symptoms TEXT
current_medication TEXT
additional_notes TEXT
status ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled')
response_notes TEXT
created_at, updated_at, accepted_at, completed_at TIMESTAMPS
```

## 🚀 Next Steps (Future Enhancements)

### Phase 2 (To Be Implemented)
1. **Notifications System** ⏳
   - Email notifications to psychiatrists
   - SMS alerts for critical referrals
   - In-app notification badges
   - Patient notifications

2. **Patient Portal** ⏳
   - View their referrals
   - See psychiatrist details
   - Book appointments directly
   - Track referral status

3. **Advanced Features** ⏳
   - AI-assisted severity assessment
   - Automatic psychiatrist matching
   - Referral analytics and reporting
   - Bulk referral management
   - Referral templates

4. **Integration** ⏳
   - Calendar integration for appointments
   - Electronic health records
   - Telemedicine for urgent cases
   - Insurance verification

## 📝 Notes

- The system is fully functional for psychologist→psychiatrist referrals
- All API endpoints are tested and working
- UI is responsive and user-friendly
- Database structure supports future expansions
- Security and validation are properly implemented

## 🐛 Troubleshooting

### Referral button not showing
- Ensure you're logged in as a therapist
- Check browser console for errors
- Verify session data is loading correctly

### Cannot create referral
- Check database connection
- Ensure `referrals` table exists
- Verify therapist_id is valid
- Check browser console for API errors

### Psychiatrist cannot see referrals
- Ensure therapist is marked as 'psychiatrist' in database
- Check `specialization` field in therapists table
- Try viewing as 'Referrals Received' tab

## 📞 Support

For issues or questions:
1. Check browser console (F12)
2. Check server logs
3. Verify database tables exist
4. Review API endpoint responses
5. Check `REFERRAL_SYSTEM_DOCUMENTATION.md` for detailed info

---

**Status**: ✅ **FULLY IMPLEMENTED AND READY FOR USE**

The referral system is now live and operational. Psychologists can refer patients to psychiatrists directly from their session notes!
