# Patient Referral System Documentation

## Overview
Implements a comprehensive referral system where psychologists can refer patients to psychiatrists when they determine the patient's condition is severe and requires specialized psychiatric care.

## Database Schema

### referrals Table
```sql
CREATE TABLE IF NOT EXISTS referrals (
  referral_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  referring_therapist_id INT NOT NULL,
  referred_to_therapist_id INT NULL,
  session_id INT NULL,
  reason TEXT NOT NULL,
  severity_level ENUM('moderate', 'severe', 'critical') DEFAULT 'severe',
  symptoms TEXT,
  current_medication TEXT,
  additional_notes TEXT,
  status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (referring_therapist_id) REFERENCES therapists(therapist_id) ON DELETE CASCADE,
  FOREIGN KEY (referred_to_therapist_id) REFERENCES therapists(therapist_id) ON DELETE SET NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE SET NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_referring_therapist (referring_therapist_id),
  INDEX idx_referred_to_therapist (referred_to_therapist_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### therapist_types (Add specialization field)
If not exists, add a specialization type to therapists table:
```sql
ALTER TABLE therapists 
ADD COLUMN specialization ENUM('psychologist', 'psychiatrist', 'counselor', 'therapist') DEFAULT 'therapist';
```

## API Endpoints

### 1. Create Referral
**POST** `/api/referrals`
- Creates a new patient referral from psychologist to psychiatrist
- Can be done during or after a session

**Request Body:**
```json
{
  "user_id": 123,
  "referring_therapist_id": 202,
  "referred_to_therapist_id": 45, // optional, can be null
  "session_id": 403, // optional
  "reason": "Patient showing severe depressive symptoms with suicidal ideation",
  "severity_level": "severe",
  "symptoms": "Persistent depression, insomnia, loss of appetite, suicidal thoughts",
  "current_medication": "None",
  "additional_notes": "Patient needs psychiatric evaluation for medication management"
}
```

### 2. Get Referrals (for Psychologist)
**GET** `/api/therapists/[id]/referrals?type=sent`
- Returns all referrals made by this therapist

### 3. Get Referrals (for Psychiatrist)
**GET** `/api/therapists/[id]/referrals?type=received`
- Returns all referrals sent to this therapist

### 4. Get Patient Referrals
**GET** `/api/users/[id]/referrals`
- Returns all referrals for a specific patient

### 5. Update Referral Status
**PATCH** `/api/referrals/[id]`
- Update referral status (accept, reject, complete)

**Request Body:**
```json
{
  "status": "accepted",
  "referred_to_therapist_id": 45, // if accepting
  "response_notes": "I can see the patient next week"
}
```

## User Flow

### Psychologist Workflow
1. Conducts session with patient
2. Determines condition is severe (needs psychiatric care)
3. Clicks "Refer to Psychiatrist" button in session notes
4. Fills out referral form:
   - Reason for referral
   - Severity level
   - Symptoms observed
   - Current medication
   - Additional notes
5. Optionally selects a specific psychiatrist or leaves it open
6. Submits referral
7. Patient and psychiatrist(s) are notified

### Psychiatrist Workflow
1. Receives notification of new referral
2. Views referral details in "Referrals" dashboard
3. Reviews:
   - Patient information
   - Referring psychologist's notes
   - Severity level
   - Symptoms
4. Can accept or decline referral
5. If accepted, patient is added to their patient list
6. Can schedule appointment with patient

### Patient Workflow
1. Receives notification of referral
2. Can view referral details
3. Sees recommended psychiatrist
4. Can book appointment with psychiatrist
5. Receives continuity of care

## Features

### Security
- Only therapists can create referrals
- Only psychiatrists can accept referrals
- Patients can view their own referrals
- Full audit trail of referral status changes

### Notifications
- Email notification to patient when referred
- Notification to psychiatrist(s) about new referral
- Status update notifications to all parties

### Integration Points
- Session notes: Add referral button
- Patient records: Show referral history
- Therapist dashboard: Show pending referrals
- Psychiatrist dashboard: Show incoming referrals

## Setup Instructions

1. Run the database migration script
2. Update therapists table with specialization
3. Deploy API endpoints
4. Update therapist session notes UI
5. Create psychiatrist referrals dashboard
6. Set up notification system

## Future Enhancements
- AI-assisted severity assessment
- Automatic psychiatrist matching based on specialization
- Referral analytics and reporting
- Integration with electronic health records
- Telemedicine integration for urgent referrals
