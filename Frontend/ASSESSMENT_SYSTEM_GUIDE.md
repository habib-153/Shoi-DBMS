# Assessment System Implementation Guide

## Overview
This document provides a complete guide to the interactive assessment system built for the therapy application. The system supports both default clinical assessments and custom therapist-created assessments with a comprehensive assignment and tracking workflow.

## Database Schema Changes

### 1. Assessment Assignments Table (NEW)
```sql
CREATE TABLE assessment_assignments (
  assignment_id INT PRIMARY KEY,
  assessment_id INT NOT NULL,
  user_id INT NOT NULL,
  assigned_by_therapist_id INT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date DATE,
  status ENUM('pending', 'completed') DEFAULT 'pending',
  completed_at DATETIME,
  score INT,
  notes TEXT,
  FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (assigned_by_therapist_id) REFERENCES therapists(therapist_id)
);
```

### 2. Modified Assessments Table
Added columns:
- `created_by_therapist_id INT` - Links custom assessments to therapists
- `is_default TINYINT(1) DEFAULT 0` - Flags system default assessments
- `assessment_type VARCHAR(50)` - Categories: Depression, Anxiety, Sleep, Stress
- `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`

### 3. Modified Assessment Questions Table
Added column:
- `options TEXT` - JSON array for multiple choice questions

### 4. Response Answers Table (NEW)
```sql
CREATE TABLE response_answers (
  response_answer_id INT PRIMARY KEY,
  response_id INT NOT NULL,
  question_id INT NOT NULL,
  answer_value INT,
  free_text TEXT,
  FOREIGN KEY (response_id) REFERENCES assessment_responses(response_id),
  FOREIGN KEY (question_id) REFERENCES assessment_questions(question_id)
);
```

### 5. Modified Assessment Responses Table
Added column:
- `assignment_id INT` - Links responses to assignments

## Default Assessments Included

### 1. PHQ-9 Depression Assessment
- 9 questions on 0-3 scale
- Measures depression severity over last 2 weeks
- Questions cover: interest, mood, sleep, energy, appetite, self-worth, concentration, movement, thoughts of harm

### 2. GAD-7 Anxiety Assessment
- 7 questions on 0-3 scale
- Measures anxiety severity over last 2 weeks
- Questions cover: nervousness, worry control, excessive worry, relaxation difficulty, restlessness, irritability, fear

### 3. Sleep Quality Assessment
- 5 questions on 0-4 scale
- Evaluates sleep patterns and quality
- Questions cover: falling asleep, staying asleep, waking early, sleep quality, daytime functioning

### 4. Stress Level Assessment
- 10 questions on 0-4 scale
- Measures perceived stress levels
- Questions cover: coping, control, overwhelm, stress management, confidence, irritation, handling difficulties

## API Endpoints

### 1. Assessment Types Management
**File:** `/app/api/assessment-types/route.ts`

#### GET /api/assessment-types
Fetches assessment templates with optional filters.

**Query Parameters:**
- `therapist_id` (optional) - Returns therapist's custom assessments + defaults
- `assessment_id` (optional) - Returns specific assessment
- `include_questions` (optional) - If "true", includes full question data

**Response:**
```json
{
  "success": true,
  "assessments": [
    {
      "assessment_id": 1,
      "name": "PHQ-9 Depression Assessment",
      "assessment_type": "Depression",
      "guidance_text": "Answer based on how you've felt over the last 2 weeks",
      "is_default": 1,
      "created_by_therapist_id": null,
      "creator_name": "System Default",
      "question_count": 9,
      "questions": [...] // If include_questions=true
    }
  ]
}
```

#### POST /api/assessment-types
Creates a new custom assessment template.

**Request Body:**
```json
{
  "name": "Custom Anxiety Assessment",
  "type": "Anxiety",
  "guidance_text": "Answer these questions honestly",
  "therapist_id": 212,
  "questions": [
    {
      "text": "How often do you feel anxious?",
      "type": "scale",
      "scale_min": 0,
      "scale_max": 10
    },
    {
      "text": "What triggers your anxiety?",
      "type": "free_text"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "assessment_id": 5,
  "message": "Assessment created successfully"
}
```

### 2. Assessment Assignments
**File:** `/app/api/users/[userId]/assigned-assessments/route.ts`

#### GET /api/users/{userId}/assigned-assessments
Fetches assessments assigned to a patient.

**Query Parameters:**
- `status` (optional) - Filter by 'pending', 'completed', or 'all'

**Response:**
```json
{
  "success": true,
  "assignments": [
    {
      "assignment_id": 1,
      "assessment_id": 1,
      "assessment_name": "PHQ-9 Depression Assessment",
      "assessment_type": "Depression",
      "guidance_text": "...",
      "assigned_by_therapist_id": 212,
      "therapist_name": "Dr. Smith",
      "assigned_at": "2025-01-20T10:00:00.000Z",
      "due_date": "2025-01-30",
      "status": "pending",
      "completed_at": null,
      "score": null,
      "total_questions": 9,
      "answered_questions": 0
    }
  ]
}
```

#### POST /api/users/{userId}/assigned-assessments
Assigns an assessment to a patient.

**Request Body:**
```json
{
  "assessment_id": 1,
  "therapist_id": 212,
  "due_date": "2025-01-30",
  "notes": "Please complete before next session"
}
```

**Response:**
```json
{
  "success": true,
  "assignment_id": 1,
  "message": "Assessment assigned successfully"
}
```

### 3. Assessment Responses
**File:** `/app/api/assessment-assignments/[assignmentId]/responses/route.ts`

#### POST /api/assessment-assignments/{assignmentId}/responses
Submits patient responses for an assigned assessment.

**Request Body:**
```json
{
  "responses": [
    {
      "question_id": 1,
      "answer_value": 2,
      "answer_text": null
    },
    {
      "question_id": 2,
      "answer_value": null,
      "answer_text": "I feel anxious about work"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response_id": 1,
  "total_score": 18,
  "message": "Assessment submitted successfully"
}
```

#### GET /api/assessment-assignments/{assignmentId}/responses
Retrieves submitted responses for an assignment.

**Response:**
```json
{
  "success": true,
  "assignment": {
    "assignment_id": 1,
    "assessment_name": "PHQ-9 Depression Assessment",
    "status": "completed",
    "total_score": 18,
    "submitted_at": "2025-01-21T14:30:00.000Z"
  },
  "responses": [
    {
      "response_answer_id": 1,
      "question_id": 1,
      "question_text": "Little interest or pleasure in doing things",
      "response_type": "scale",
      "answer_value": 2,
      "free_text": null
    }
  ]
}
```

## Frontend Implementation

### Patient Assessment Page
**File:** `/app/assessments/page_new.tsx`

**Features:**
- Tab view for pending vs completed assessments
- Card-based assessment display with progress tracking
- Full-screen assessment taking interface
- Question types supported:
  - Scale (slider input)
  - Multiple choice (radio buttons)
  - Free text (textarea)
  - Yes/No (binary choice)
- Progress bar showing question completion
- Previous/Next navigation
- Results screen with score display
- Automatic notification to therapist on completion

**Usage:**
1. Patient views assigned assessments
2. Clicks "Start Assessment" or "Continue"
3. Answers questions one by one
4. Submits at the end
5. Sees completion screen with score
6. Therapist receives notification

### Therapist Dashboard (TODO)
**Planned File:** `/app/therapist/assessments/page.tsx`

**Planned Features:**
- View all available assessments (default + custom)
- Create new custom assessments
- Assign assessments to patients
- View patient assessment history
- Review submitted responses
- Track completion rates
- Analytics and trends

## Question Types Explained

### 1. Scale (Likert)
```json
{
  "response_type": "scale",
  "scale_min": 0,
  "scale_max": 3,
  "question_text": "How often have you felt down?"
}
```
Renders as: Slider from 0 to 3
Score contribution: Selected value

### 2. Multiple Choice
```json
{
  "response_type": "multiple_choice",
  "options": "[\"Never\", \"Sometimes\", \"Often\", \"Always\"]",
  "question_text": "How often do you exercise?"
}
```
Renders as: Radio buttons
Score contribution: Index of selected option (0, 1, 2, 3)

### 3. Free Text
```json
{
  "response_type": "free_text",
  "question_text": "Describe your main stressor"
}
```
Renders as: Textarea
Score contribution: 0 (not scored, qualitative data)

### 4. Yes/No
```json
{
  "response_type": "yes_no",
  "question_text": "Do you feel hopeless?"
}
```
Renders as: Two buttons (Yes/No)
Score contribution: 1 for Yes, 0 for No

## Scoring System

### Automatic Scoring
- Scale questions: Value directly contributes to score
- Multiple choice: Index of selected option (0-N)
- Yes/No: 1 for Yes, 0 for No
- Free text: Does not contribute to score

### Score Calculation
Total score = Sum of all answer_value fields

Example PHQ-9 (9 questions, 0-3 each):
- Minimum score: 0
- Maximum score: 27
- Interpretation:
  - 0-4: Minimal depression
  - 5-9: Mild depression
  - 10-14: Moderate depression
  - 15-19: Moderately severe depression
  - 20-27: Severe depression

## Notification System Integration

### Patient Notifications
When a therapist assigns an assessment:
```sql
INSERT INTO notifications (
  recipient_type = 'user',
  recipient_id = patient_id,
  notification_type = 'assessment',
  title = 'New Assessment Assigned',
  message = 'Your therapist has assigned you: [Assessment Name]',
  action_url = '/assessments'
)
```

### Therapist Notifications
When a patient completes an assessment:
```sql
INSERT INTO notifications (
  recipient_type = 'therapist',
  recipient_id = therapist_id,
  notification_type = 'assessment',
  title = 'Assessment Completed',
  message = 'Your patient has completed: [Assessment Name]. Score: [score]',
  action_url = '/therapist/patients/[patient_id]?tab=assessments'
)
```

## ID Generation Pattern

All tables in this system require manual ID generation:
```javascript
// Before every INSERT
const [maxId]: any = await query(
  `SELECT IFNULL(MAX(table_id), 0) + 1 as next_id FROM table_name`
);
const nextId = maxId[0]?.next_id || 1;

// Use in INSERT
await query(
  `INSERT INTO table_name (table_id, ...) VALUES (?, ...)`,
  [nextId, ...]
);
```

Tables requiring this:
- assessment_assignments (assignment_id)
- assessment_questions (question_id)
- assessment_responses (response_id)
- response_answers (response_answer_id)
- notifications (notification_id)

## Implementation Checklist

### ✅ Completed
- [x] Database migration script created
- [x] Response answers table added
- [x] Assessment types API (GET/POST)
- [x] Assignment API (GET/POST)
- [x] Response submission API (POST)
- [x] Response retrieval API (GET)
- [x] Patient assessment page (UI)
- [x] Default assessments (PHQ-9, GAD-7, Sleep, Stress)
- [x] Question type support (scale, multiple choice, text, yes/no)
- [x] Progress tracking
- [x] Automatic scoring
- [x] Notification integration

### 🟡 Pending
- [ ] Execute database migration
- [ ] Test all APIs
- [ ] Therapist assessment dashboard
- [ ] Assessment assignment UI for therapists
- [ ] Custom assessment creation UI
- [ ] Assessment analytics/trends view
- [ ] Patient assessment history view (therapist side)
- [ ] Score interpretation guidelines
- [ ] Assessment scheduling/reminders

## Next Steps

### 1. Database Migration (CRITICAL)
```bash
# Execute the migration script
mysql -u root -p rahi < ASSESSMENT_SYSTEM_MIGRATION.sql

# Verify tables created
mysql -u root -p rahi -e "SHOW TABLES;"
mysql -u root -p rahi -e "SELECT * FROM assessments WHERE is_default = 1;"
```

### 2. Test Patient Flow
1. Login as patient (user_id = 680)
2. Have therapist assign assessment via API:
```bash
curl -X POST http://localhost:3000/api/users/680/assigned-assessments \
  -H "Content-Type: application/json" \
  -d '{
    "assessment_id": 1,
    "therapist_id": 212,
    "due_date": "2025-02-01"
  }'
```
3. Visit `/assessments` page
4. Complete assessment
5. Verify score and completion status

### 3. Build Therapist Dashboard
Create `/app/therapist/assessments/page.tsx` with:
- List of all assessments (default + custom)
- "Assign to Patient" functionality
- Patient selection modal
- Assessment history view
- Response review interface

### 4. Add Analytics
Create `/app/therapist/patients/[userId]/assessments-analytics.tsx` with:
- Line charts showing score trends over time
- Comparison across assessment types
- Progress indicators
- Alerts for concerning scores

## Troubleshooting

### Common Issues

**1. "Field 'assignment_id' doesn't have a default value"**
- Cause: Forgot to generate ID before INSERT
- Fix: Add ID generation query before INSERT

**2. "Cannot read property 'questions' of undefined"**
- Cause: Assessment not found or include_questions not set
- Fix: Check assessment_id exists and add `?include_questions=true`

**3. Responses not linking to assignment**
- Cause: Missing assignment_id in response
- Fix: Ensure POST includes assignment_id in body

**4. Score calculation incorrect**
- Cause: NULL values in answer_value fields
- Fix: Handle NULL by defaulting to 0 in sum

## Security Considerations

1. **Authorization**: Verify therapist owns assessment before assignment
2. **Privacy**: Only show patient their own assignments
3. **Data Validation**: Validate answer_value within scale ranges
4. **SQL Injection**: Use parameterized queries (already implemented)
5. **Input Sanitization**: Validate JSON in options field

## Performance Optimization

### Indexes Created
```sql
CREATE INDEX idx_assignments_user ON assessment_assignments(user_id);
CREATE INDEX idx_assignments_therapist ON assessment_assignments(assigned_by_therapist_id);
CREATE INDEX idx_assignments_status ON assessment_assignments(status);
CREATE INDEX idx_responses_assignment ON assessment_responses(assignment_id);
CREATE INDEX idx_answer_response ON response_answers(response_id);
```

### Query Optimization Tips
1. Use LEFT JOIN when responses may not exist
2. Limit results with pagination for large datasets
3. Cache default assessments on frontend
4. Use EXISTS instead of COUNT for checking duplicates

## Future Enhancements

1. **Recurring Assessments**: Schedule automatic weekly/monthly assignments
2. **Conditional Logic**: Skip questions based on previous answers
3. **Multi-language Support**: Translate assessments
4. **PDF Export**: Generate assessment reports
5. **Comparison Tools**: Compare patient to population norms
6. **Reminders**: Email/SMS reminders for pending assessments
7. **Partial Save**: Allow saving progress and continuing later
8. **Offline Mode**: Complete assessments without internet
9. **Voice Input**: Speak answers for free text questions
10. **Accessibility**: Screen reader support, keyboard navigation

## Support and Documentation

For questions or issues:
1. Check this guide first
2. Review API endpoint documentation
3. Check console logs for error messages
4. Verify database schema matches migration
5. Test with default assessments before custom ones

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Backend Complete, Frontend In Progress
