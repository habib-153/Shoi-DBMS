# Database Cleanup - Symptoms Tables

## Summary
Successfully cleaned up the symptoms-related tables to keep only 9 essential primary symptoms.

## Changes Made

### 1. **Symptoms Table**
- **Before**: 200 symptoms (many duplicates with severity variations)
- **After**: 9 essential primary symptoms only
- **Deleted**: 191 non-essential symptoms

### 2. **User Symptoms Table**
- **Before**: Had user symptom records
- **After**: Completely cleared (all records deleted)
- **Auto-increment**: Reset to 1

## The 9 Essential Symptoms Kept

| ID | English Name | Bengali Name |
|----|-------------|--------------|
| 1  | Low mood | মন খারাপ |
| 3  | Insomnia (sleep difficulty) | অনিদ্রা |
| 5  | Anxiety (generalized) | উদ্বেগ |
| 6  | Panic attacks | হঠাৎ আতঙ্ক |
| 7  | Irritability | খিটখিটে মেজাজ |
| 8  | Poor concentration | মনোযোগে ঘাটতি |
| 13 | Suicidal ideation | আত্মহত্যার চিন্তা |
| 14 | Fatigue / low energy | অবসাদ/শক্তিহীনতা |
| 31 | Social anxiety | সামাজিক উদ্বেগ |

## Why These 9 Symptoms?

These represent the **core primary mental health symptoms** that are:
1. **Most Common**: Frequently reported by users
2. **Clinically Significant**: Important diagnostic indicators
3. **Well-Defined**: Clear, unambiguous symptoms
4. **Non-Redundant**: No severity variations or duplicates
5. **Bilingual**: Have both English and Bengali translations

## Cleanup Process

1. ✅ Deleted all records from `user_symptoms` table
2. ✅ Deleted 191 symptoms from `symptoms` table (keeping only IDs: 1, 3, 5, 6, 7, 8, 13, 14, 31)
3. ✅ Reset auto-increment counters
4. ✅ Verified final count: 9 symptoms

## API Endpoint Used
- **Endpoint**: `POST /api/clean-symptoms`
- **File**: `/app/api/clean-symptoms/route.ts`
- **Function**: Automated cleanup script

## Database State
```sql
-- Symptoms table
SELECT COUNT(*) FROM symptoms;  -- Result: 9

-- User symptoms table  
SELECT COUNT(*) FROM user_symptoms;  -- Result: 0
```

## Benefits
- ✅ **Simplified symptom selection** for users
- ✅ **Cleaner database** with no redundant data
- ✅ **Better UX** - easier to choose from 9 clear symptoms
- ✅ **Improved performance** - faster queries
- ✅ **Maintainable** - focused on essentials

## Next Steps (Optional)
- Users can now select from these 9 primary symptoms
- Health tracker will use this simplified symptom list
- Assessments can focus on these core indicators
- Can add more symptoms later if clinically needed

## Files Created
- `/app/api/clean-symptoms/route.ts` - Cleanup script
- `SYMPTOMS_CLEANUP_SUMMARY.md` - This documentation
