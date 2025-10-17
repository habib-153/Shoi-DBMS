# Therapist Assessment Management - Quick Guide

## 📍 Location
**Frontend Page:** `/app/therapist/assessments/page.tsx`
**URL:** `http://localhost:3000/therapist/assessments`

## 🎯 Features Implemented

### 1. **Assessment Library Tab**
View all available assessments including:
- ✅ Default clinical assessments (PHQ-9, GAD-7, Sleep, Stress)
- ✅ Custom assessments created by the therapist
- ✅ Search functionality
- ✅ Filter by assessment type
- ✅ Question count display
- ✅ "Assign to Patient" button for each assessment

### 2. **Assigned Assessments Tab**
Track all assessments you've assigned:
- ✅ Patient name and email
- ✅ Assessment name and type
- ✅ Assigned date
- ✅ Due date
- ✅ Status (Pending/Completed)
- ✅ Score (for completed assessments)
- ✅ "View Details" link to patient profile

### 3. **Statistics Dashboard**
Quick overview cards showing:
- ✅ Total assessments in library
- ✅ Total assigned assessments
- ✅ Pending assessments count
- ✅ Completed assessments count

### 4. **Assignment Modal**
Easy workflow to assign assessments:
- ✅ Select patient from dropdown
- ✅ Optional due date picker
- ✅ Optional notes field
- ✅ Instant assignment with notification sent to patient

## 🔌 API Endpoints Used

### 1. GET Assessment Library
```
GET /api/assessment-types?therapist_id={therapistId}&include_questions=false
```
Returns all default + custom assessments for this therapist.

### 2. GET Assigned Assessments
```
GET /api/therapist/{therapistId}/assigned-assessments
```
Returns all assessments assigned by this therapist with patient info and status.

### 3. GET Patient List
```
GET /api/therapist/{therapistId}/patients
```
Returns list of all patients for the dropdown selector.

### 4. POST Assign Assessment
```
POST /api/users/{userId}/assigned-assessments
Body: {
  assessment_id: number,
  therapist_id: number,
  due_date: string (optional),
  notes: string (optional)
}
```
Assigns an assessment to a patient and sends notification.

## 📊 How It Works

### **Assigning an Assessment**
1. Therapist browses assessment library
2. Clicks "Assign to Patient" on desired assessment
3. Modal opens with assignment form
4. Selects patient from dropdown
5. Optionally sets due date and notes
6. Clicks "Assign Assessment"
7. Patient receives notification
8. Assignment appears in "Assigned Assessments" tab

### **Tracking Progress**
1. Switch to "Assigned Assessments" tab
2. See all assignments in table format
3. Filter by status (pending vs completed)
4. View scores for completed assessments
5. Click "View Details" to see full responses

### **Patient Workflow** (Patient Side)
1. Patient receives notification
2. Goes to `/assessments` page
3. Sees assignment in "Pending" tab
4. Clicks "Start Assessment"
5. Completes all questions
6. Submits assessment
7. Therapist receives completion notification
8. Status updates to "Completed" with score

## 🎨 UI Components

### **Search & Filter Bar**
- Search input with icon
- Type dropdown filter (Depression, Anxiety, Sleep, Stress)
- "Create Custom" button (UI placeholder for now)

### **Assessment Cards** (Library View)
- Assessment name and type badge
- "Default" badge for system assessments
- Guidance text preview
- Question count and creator info
- "Assign to Patient" button

### **Assignments Table** (Assigned View)
Columns:
- Patient name
- Assessment name
- Type badge
- Assigned date
- Due date
- Status badge (Pending/Completed)
- Score
- Actions (View Details)

### **Assignment Modal**
- Assessment summary
- Patient selector dropdown
- Due date picker (HTML5 date input)
- Notes textarea
- Cancel/Assign buttons

## 🚀 Getting Started

### **1. Access the Page**
```
Login as therapist → Navigate to /therapist/assessments
```

### **2. Assign Your First Assessment**
```
1. You'll see 4 default assessments in the library
2. Click "Assign to Patient" on PHQ-9
3. Select a patient from your list
4. Set due date (optional)
5. Click "Assign Assessment"
```

### **3. Track Progress**
```
1. Switch to "Assigned Assessments" tab
2. See the assignment with "Pending" status
3. Wait for patient to complete
4. Status updates to "Completed" with score
5. Click "View Details" to see responses
```

## 🔧 Customization Options

### **Add Custom Assessment Type Filter**
Edit the filter dropdown to add more types:
```typescript
const assessmentTypes = ['all', 'Depression', 'Anxiety', 'Sleep', 'Stress', 'Custom'];
```

### **Change Stats Colors**
Modify the stat cards in the stats section:
```typescript
<div className="bg-white rounded-lg shadow p-4">
  // Change icon colors: text-blue-500, text-purple-500, etc.
</div>
```

### **Add Bulk Actions**
Extend the table with checkboxes for bulk operations:
```typescript
// Add checkbox column
// Add "Assign Multiple" feature
// Add "Send Reminders" action
```

## 🐛 Troubleshooting

### **Issue: No assessments showing in library**
**Solution**: Run database migration first
```bash
mysql -u root -p rahi < ASSESSMENT_SYSTEM_MIGRATION.sql
```

### **Issue: No patients in dropdown**
**Solution**: Check therapist has active appointments with patients
```sql
SELECT DISTINCT u.user_id, u.full_name 
FROM users u
JOIN appointments a ON u.user_id = a.user_id
WHERE a.therapist_id = YOUR_THERAPIST_ID;
```

### **Issue: Assignment not showing up**
**Solution**: Check API response and browser console for errors
```javascript
// Open browser console and check for:
// - 404 errors (endpoint not found)
// - 500 errors (database/server issues)
// - CORS errors (if accessing from different domain)
```

### **Issue: Patients not receiving notifications**
**Solution**: Verify notifications API is working
```sql
SELECT * FROM notifications 
WHERE notification_type = 'assessment' 
ORDER BY created_at DESC 
LIMIT 5;
```

## 📈 Future Enhancements

### **Coming Soon**
- [ ] Custom assessment builder UI
- [ ] Assessment analytics dashboard
- [ ] Bulk assignment feature
- [ ] Assessment templates management
- [ ] Export results to PDF
- [ ] Email reminders for pending assessments
- [ ] Assessment comparison charts
- [ ] Patient progress timeline

### **Advanced Features**
- [ ] Conditional question logic
- [ ] Multi-page assessments
- [ ] Real-time collaboration
- [ ] Voice input for responses
- [ ] Mobile app integration
- [ ] Automated scoring interpretation
- [ ] Population norms comparison

## 🔗 Related Files

**Frontend:**
- `/app/therapist/assessments/page.tsx` - Main therapist page
- `/app/assessments/page.tsx` - Patient assessment page

**Backend:**
- `/app/api/assessment-types/route.ts` - Assessment library API
- `/app/api/therapist/[therapistId]/assigned-assessments/route.ts` - Assigned assessments API
- `/app/api/users/[userId]/assigned-assessments/route.ts` - Assignment and patient view API
- `/app/api/assessment-assignments/[assignmentId]/responses/route.ts` - Response submission API

**Documentation:**
- `ASSESSMENT_SYSTEM_GUIDE.md` - Complete system documentation
- `ASSESSMENT_QUICKSTART.md` - Quick start guide
- `ASSESSMENT_SYSTEM_MIGRATION.sql` - Database schema

## 💡 Tips

1. **Always check the stats cards** - They give you quick insights into assessment activity
2. **Use the search function** - Quickly find specific assessments by name or type
3. **Set due dates** - Helps patients prioritize and improves completion rates
4. **Add notes** - Provide context or instructions when assigning
5. **Review completed assessments promptly** - Shows patients you're engaged with their progress

---

**Need Help?** Check the main documentation in `ASSESSMENT_SYSTEM_GUIDE.md` or contact support.
