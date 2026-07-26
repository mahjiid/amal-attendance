-- Add authenticated user to employees table
-- Run this in Supabase SQL Editor

-- First, check if user already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'miloboy188@gmail.com') THEN
    -- Insert miloboy188@gmail.com into employees table
    INSERT INTO employees (staff_id, name, role, department, email, status, created_at)
    VALUES (
      'AMT-TEST',
      'Test User',
      'Admin',
      'IT',
      'miloboy188@gmail.com',
      'Active',
      NOW()
    );
  END IF;
END $$;

-- Verify it was added
SELECT * FROM employees WHERE email = 'miloboy188@gmail.com';
