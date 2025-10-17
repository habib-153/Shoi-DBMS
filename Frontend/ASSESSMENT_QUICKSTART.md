# Assessment System - Quick Start Guide

## Step 1: Execute Database Migration

```bash
# Navigate to project directory
cd /Users/mustansirrishi/Desktop/dbms\ project/Rahi/Frontend

# Execute migration (replace 'root' and 'rahi' with your credentials/database name)
mysql -u root -p rahi < ASSESSMENT_SYSTEM_MIGRATION.sql

# Verify default assessments were created
mysql -u root -p rahi -e "SELECT assessment_id, name, assessment_type FROM assessments WHERE is_default = 1;"
```

Expected output:
```
+---------------+----------------------------------+-----------------+
| assessment_id | name                             | assessment_type |
+---------------+----------------------------------+-----------------+
|             1 | PHQ-9 Depression Assessment      | Depression      |
|             2 | GAD-7 Anxiety Assessment         | Anxiety         |
|             3 | Sleep Quality Assessment         | Sleep           |
|             4 | Stress Level Assessment          | Stress          |
+---------------+----------------------------------+-----------------+
```

## Step 2: Replace Old Assessments Page

```bash
# Backup old page (optional)
mv app/assessments/page.tsx app/assessments/page.tsx.old

# Use new implementation
mv app/assessments/page_new.tsx app/assessments/page.tsx
```

## Step 3: Test Patient Assignment (Via API)

```bash
# Assign PHQ-9 Depression Assessment to patient 680 by therapist 212
curl -X POST http://localhost:3000/api/users/680/assigned-assessments \
  -H "Content-Type: application/json" \
  -d '{
    "assessment_id": 1,
    "therapist_id": 212,
    "due_date": "2025-02-01"
  }'
```

Expected response:
```json
{
  "success": true,
  "assignment_id": 1,
  "message": "Assessment assigned successfully"
}
```

## Step 4: Test Patient Flow

1. Login as patient (user_id = 680)
2. Navigate to `/assessments`
3. You should see the PHQ-9 assessment in "Pending" tab
4. Click "Start Assessment"
5. Answer all 9 questions using the slider
6. Click "Submit" on last question
7. See completion screen with score
8. Check "Completed" tab to see finished assessment

## Step 5: Verify Notifications

```sql
-- Check if notification was created for therapist
SELECT * FROM notifications 
WHERE recipient_type = 'therapist' 
  AND recipient_id = 212 
  AND notification_type = 'assessment'
ORDER BY created_at DESC 
LIMIT 1;
```

## Step 6: Check Responses

```bash
# Get assignment responses via API
curl http://localhost:3000/api/assessment-assignments/1/responses
```

## Available Endpoints

### For Patients
- `GET /api/users/{userId}/assigned-assessments?status=pending` - View pending assessments
- `GET /api/users/{userId}/assigned-assessments?status=completed` - View completed assessments
- `POST /api/assessment-assignments/{assignmentId}/responses` - Submit responses
- `GET /api/assessment-assignments/{assignmentId}/responses` - View submitted responses

### For Therapists
- `GET /api/assessment-types` - View all default assessments
- `GET /api/assessment-types?therapist_id={id}` - View default + custom assessments
- `POST /api/assessment-types` - Create custom assessment
- `POST /api/users/{userId}/assigned-assessments` - Assign assessment to patient

## Default Assessments Available

1. **PHQ-9 Depression Assessment** (assessment_id: 1)
   - 9 questions, scale 0-3
   - Max score: 27
   
2. **GAD-7 Anxiety Assessment** (assessment_id: 2)
   - 7 questions, scale 0-3
   - Max score: 21

3. **Sleep Quality Assessment** (assessment_id: 3)
   - 5 questions, scale 0-4
   - Max score: 20

4. **Stress Level Assessment** (assessment_id: 4)
   - 10 questions, scale 0-4
   - Max score: 40

## Testing Checklist

- [ ] Database migration executed successfully
- [ ] Default assessments visible in database
- [ ] Can assign assessment via API
- [ ] Patient sees assignment in `/assessments` page
- [ ] Can complete assessment (all question types work)
- [ ] Score calculates correctly
- [ ] Assignment status changes to "completed"
- [ ] Therapist receives notification
- [ ] Completed assessment shows in "Completed" tab
- [ ] Can view responses via API

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution**: Check MySQL is running and credentials are correct

### Issue: "Table 'assessment_assignments' doesn't exist"
**Solution**: Database migration not executed. Run Step 1 again.

### Issue: "No assessments showing"
**Solution**: 
1. Check if default assessments exist: `SELECT * FROM assessments WHERE is_default = 1;`
2. If empty, migration didn't complete. Re-run migration.

### Issue: "Field 'assignment_id' doesn't have a default value"
**Solution**: API routes are generating IDs correctly. This shouldn't happen with new code.

### Issue: "userId is not defined"
**Solution**: Make sure you're logged in. Check browser console for auth errors.

## Next Development Tasks

### High Priority
1. Build therapist assessment dashboard (`/therapist/assessments`)
2. Add assignment UI for therapists
3. Add patient assessment history view (therapist side)

### Medium Priority
4. Create custom assessment builder UI
5. Add assessment analytics/trends
6. Add score interpretation guidelines

### Low Priority
7. Add email reminders for pending assessments
8. Add partial save functionality
9. Add PDF export for reports
10. Add recurring assessment scheduling

## Support

For detailed documentation, see: `ASSESSMENT_SYSTEM_GUIDE.md`

For database schema details, see: `ASSESSMENT_SYSTEM_MIGRATION.sql`

---

**Quick Reference Commands**

```bash
# View all assessments
curl http://localhost:3000/api/assessment-types

# Assign assessment
curl -X POST http://localhost:3000/api/users/680/assigned-assessments \
  -H "Content-Type: application/json" \
  -d '{"assessment_id": 1, "therapist_id": 212, "due_date": "2025-02-01"}'

# View patient's assignments
curl http://localhost:3000/api/users/680/assigned-assessments

# Submit responses
curl -X POST http://localhost:3000/api/assessment-assignments/1/responses \
  -H "Content-Type: application/json" \
  -d '{"responses": [{"question_id": 1, "answer_value": 2, "answer_text": null}]}'
```
