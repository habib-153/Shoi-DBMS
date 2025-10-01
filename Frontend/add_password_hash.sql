-- Add password_hash column to therapists table
ALTER TABLE therapists ADD COLUMN password_hash VARCHAR(255) NOT NULL;
