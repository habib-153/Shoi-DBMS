# SESSION NOTES SYSTEM - Complete Flow

## 📋 Overview
The session notes system is now fully integrated with appointments. Each appointment can have exactly ONE session, and each session can have exactly ONE session note (which is editable).

## 🔗 Database Structure

```
appointments (time-specific bookings)
    ↓ (1:1 relationship)
sessions (completed appointments)
    ↓ (1:1 relationship)  
session_notes (therapist notes - editable)
```

## 📊 Complete Flow

### **1. User Books Appointment**
```
User 680 books appointment with Therapist 202
  └── POST /api/appointments
  └── Creates: appointment_id: 484
      - user_id: 680
      - therapist_id: 202
      - start_time: 2025-10-12 11:00
      - end_time: 2025-10-12 12:00
      - status: 'pending'
```

### **2. User Pays for Appointment**
```
Payment completed
  └── PATCH /api/payments/{payment_id}
  └── Updates appointment: status = 'paid'/'confirmed'
```

### **3. Appointment Time Arrives (Therapist Completes)**
```
Therapist marks appointment as completed
  └── POST /api/appointments/484/complete
  
  OR auto-complete via:
  └── PATCH /api/appointments/484 {status: 'completed'}
  
  Backend automatically:
  ✅ Updates appointment: status = 'completed'
  ✅ Creates session (if doesn't exist):
      - session_id: X
      - appointment_id: 484
      - session_date: 2025-10-12
      - duration_min: 60 (calculated from start/end times)
      - status: 'completed'
```

### **4. Therapist Adds Session Note**
```
Therapist navigates to session X
  └── GET /api/sessions/X/notes
  └── Returns existing note OR empty (if none)

Therapist fills form and saves:
  └── POST /api/sessions/X/notes
      {
        "summary": "Patient showed improvement...",
        "homework": "Practice mindfulness daily",
        "therapist_private_notes": "Consider CBT approach",
        "visible_to_user": true,
        "therapist_id": 202  // Optional - for validation
      }

  Backend logic:
  ✅ Checks if note exists for this session
  ✅ If exists: UPDATE existing note (editable!)
  ✅ If not exists: INSERT new note
  ✅ Validates therapist owns this session
```

### **5. Editing Existing Notes**
```
Therapist edits same session note later:
  └── POST /api/sessions/X/notes (same endpoint!)
      {
        "summary": "Updated: Patient made significant progress...",
        "homework": "Continue mindfulness + journaling",
        ...
      }

  Backend automatically:
  ✅ Detects existing note (by session_id)
  ✅ UPDATES instead of creating new
  ✅ Returns: "Session note updated successfully"
```

## 🔌 API Endpoints

### **For Therapists:**

#### **1. Get All Appointments with Session/Note Status**
```bash
GET /api/therapist/{therapistId}/appointments-with-sessions

Response:
{
  "success": true,
  "appointments": [
    {
      "appointment_id": 484,
      "user_name": "Monira Khatun",
      "start_time": "2025-10-12 11:00",
      "appointment_status": "completed",
      "has_session": 1,          // ✅ Session created
      "session_id": 123,
      "has_note": 0,              // ❌ Note not yet added
      "note_id": null
    },
    {
      "appointment_id": 485,
      "user_name": "Monira Khatun",
      "start_time": "2025-10-13 14:00",
      "appointment_status": "confirmed",
      "has_session": 0,          // ❌ Not completed yet
      "session_id": null,
      "has_note": 0,
      "note_id": null
    }
  ],
  "summary": {
    "total": 2,
    "with_sessions": 1,
    "with_notes": 0,
    "pending_notes": 1          // Sessions without notes
  }
}
```

#### **2. Complete Appointment (Auto-creates Session)**
```bash
POST /api/appointments/484/complete

Response:
{
  "success": true,
  "message": "Appointment completed and session created",
  "appointment_id": 484,
  "session_id": 123,
  "session_already_existed": false,  // or true if session existed
  "has_note": false,                 // or true if note exists
  "note": null                       // or note object if exists
}
```

#### **3. Get/Check Session Note**
```bash
GET /api/sessions/123/notes

Response (if note exists):
{
  "success": true,
  "notes": [
    {
      "note_id": 45,
      "session_id": 123,
      "summary": "Patient showed improvement...",
      "homework": "Practice mindfulness",
      "therapist_private_notes": "Private notes here",
      "visible_to_user": 1,
      "created_at": "2025-10-12 13:00",
      "user_name": "Monira Khatun",
      "therapist_name": "Dr. Smith"
    }
  ]
}

Response (if no note yet):
{
  "success": true,
  "notes": []
}
```

#### **4. Create/Update Session Note**
```bash
POST /api/sessions/123/notes
{
  "summary": "Session summary here",
  "homework": "Homework assignments",
  "therapist_private_notes": "Private notes",
  "visible_to_user": true,
  "therapist_id": 202  // Optional for validation
}

Response (first time):
{
  "success": true,
  "note_id": 45,
  "message": "Session note created successfully",
  "session_details": {...}
}

Response (editing):
{
  "success": true,
  "note_id": 45,
  "message": "Session note updated successfully",
  "session_details": {...}
}
```

## 🛡️ Security & Validation

### **Enforced Rules:**

1. **One Session Per Appointment**
   - ✅ Enforced in `/appointments/{id}/complete`
   - ✅ Returns existing session if already created
   - ❌ Cannot create duplicate sessions

2. **One Note Per Session (Editable)**
   - ✅ POST to `/sessions/{id}/notes` checks for existing note
   - ✅ If exists: UPDATE
   - ✅ If not: INSERT
   - ✅ Always uses same endpoint for create/edit

3. **Therapist Ownership Validation**
   - ✅ Session must belong to therapist making the note
   - ✅ Backend validates: `session.therapist_id == therapist_id`
   - ❌ Therapist 202 cannot edit Therapist 22's notes

4. **Appointment Completion**
   - ✅ Only 'completed' appointments auto-create sessions
   - ✅ Session created with appointment's date/time/duration

## 📱 Frontend Integration

### **Therapist Dashboard:**
```typescript
// Fetch appointments with session/note status
const appointments = await fetch(`/api/therapist/${therapistId}/appointments-with-sessions`);

// Show in UI:
appointments.forEach(apt => {
  if (apt.has_session && !apt.has_note) {
    // Show "Add Note" button
  } else if (apt.has_session && apt.has_note) {
    // Show "Edit Note" button
  } else {
    // Show "Complete Appointment First"
  }
});
```

### **Session Notes Form:**
```typescript
// Load existing note (if any)
const response = await fetch(`/api/sessions/${sessionId}/notes`);
const { notes } = await response.json();
const existingNote = notes[0] || null;

// Pre-fill form if editing
if (existingNote) {
  setFormData({
    summary: existingNote.summary,
    homework: existingNote.homework,
    therapist_private_notes: existingNote.therapist_private_notes,
    visible_to_user: existingNote.visible_to_user
  });
}

// Save (works for both create and edit!)
await fetch(`/api/sessions/${sessionId}/notes`, {
  method: 'POST',
  body: JSON.stringify(formData)
});
```

## ✅ Testing Checklist

- [ ] Book appointment → Gets appointment_id
- [ ] Pay for appointment → Status changes to 'paid'
- [ ] Complete appointment → Auto-creates session
- [ ] Add session note → Note created
- [ ] Edit same note → Note updated (not duplicated)
- [ ] Try to add note to other therapist's session → Error 403
- [ ] Try to create duplicate session → Returns existing session
- [ ] Fetch appointments list → Shows has_session, has_note flags

## 🎯 Summary

**Key Points:**
1. ✅ Each appointment = 1 session (auto-created on completion)
2. ✅ Each session = 1 note (editable via same POST endpoint)
3. ✅ Time-based: Sessions use appointment start/end times
4. ✅ Security: Therapist ownership validated
5. ✅ Editable: POST updates existing note if found
