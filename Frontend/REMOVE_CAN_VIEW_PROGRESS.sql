-- Remove can_view_progress column from family_members table
ALTER TABLE family_members DROP COLUMN can_view_progress;

-- Verify the change
DESCRIBE family_members;

-- Check if column is removed
SHOW COLUMNS FROM family_members;
