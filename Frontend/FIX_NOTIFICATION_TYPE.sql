-- Fix notification_type column to support 'assessment' type
-- Run this in phpMyAdmin

-- Option 1: If it's a VARCHAR that's too short, make it longer
ALTER TABLE notifications 
MODIFY COLUMN notification_type VARCHAR(50);

-- Option 2: If it's an ENUM, add 'assessment' to the allowed values
-- First check what type it is with:
-- DESCRIBE notifications;

-- If it's an ENUM, run this:
-- ALTER TABLE notifications 
-- MODIFY COLUMN notification_type ENUM('message', 'appointment', 'session', 'payment', 'assessment', 'system') DEFAULT 'system';

-- Verify the change
DESCRIBE notifications;
