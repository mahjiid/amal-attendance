-- Fix Database Schema Mismatch
-- Run this in Supabase SQL Editor

-- The app expects 'clock_in' and 'clock_out' but your database has 'check_in' and 'check_out'
-- This script will rename the columns to match what the app expects

-- Option 1: Rename existing columns (preserves data)
ALTER TABLE attendance_logs RENAME COLUMN check_in TO clock_in;
ALTER TABLE attendance_logs RENAME COLUMN check_out TO clock_out;

-- Also add missing columns that the app expects
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS location_lat decimal;
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS location_lng decimal;
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS method text DEFAULT 'Web';

-- Update employee_id to be nullable (for auth users)
ALTER TABLE attendance_logs ALTER COLUMN employee_id DROP NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_logs_user_id ON attendance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_date ON attendance_logs(date);

-- Success message
SELECT 'Database schema updated successfully!' as message;
