-- Migration Script: Add specialization column to therapists table
-- Run this if you get "Failed to add therapist" error during registration

USE shoi;

-- Check if specialization column exists and add it if not
SET @dbname = DATABASE();
SET @tablename = 'therapists';
SET @columnname = 'specialization';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1;', -- Column exists, do nothing
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' ENUM(''psychologist'', ''psychiatrist'', ''counselor'', ''therapist'') DEFAULT ''therapist'' AFTER phone;')
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verify the column was added
DESCRIBE therapists;

-- Update existing therapists to have default specialization
UPDATE therapists 
SET specialization = 'therapist' 
WHERE specialization IS NULL;

SELECT 'Migration completed successfully!' AS status;
