-- First, check what columns exist in referrals table
SHOW COLUMNS FROM referrals;

-- If response_notes doesn't exist, add it
ALTER TABLE referrals 
ADD COLUMN IF NOT EXISTS response_notes TEXT NULL
AFTER additional_notes;

-- Verify it was added
SHOW COLUMNS FROM referrals;
