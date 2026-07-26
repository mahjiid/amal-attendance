-- Fix employee_name NOT NULL constraint issue
-- Run this in Supabase SQL Editor

-- Option 1: Make employee_name nullable (recommended for flexibility)
ALTER TABLE attendance_logs ALTER COLUMN employee_name DROP NOT NULL;

-- Option 2: Set a default value
-- ALTER TABLE attendance_logs ALTER COLUMN employee_name SET DEFAULT 'Unknown';

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'attendance_logs' 
AND column_name = 'employee_name';
