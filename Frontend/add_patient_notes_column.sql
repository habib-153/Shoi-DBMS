-- Add patient_notes column to patient_referrals table
-- This will store the patient's reason for accepting/rejecting a referral

USE shoi;

-- Add patient_notes column if it doesn't exist
ALTER TABLE patient_referrals 
ADD COLUMN IF NOT EXISTS patient_notes TEXT COMMENT 'Patient response or notes about the referral';

-- Verify the column was added
DESCRIBE patient_referrals;

-- Show sample data
SELECT referral_id, user_id, status, patient_notes, created_at 
FROM patient_referrals 
ORDER BY created_at DESC 
LIMIT 5;
