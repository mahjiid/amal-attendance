-- Check and add zair.codev@gmail.com to employees table
-- Run this in Supabase SQL Editor

-- First, check if user exists in employees table
SELECT * FROM employees WHERE email = 'zair.codev@gmail.com';

-- If not found, add the user
INSERT INTO employees (
  email,
  name,
  staff_id,
  role,
  department,
  status
) VALUES (
  'zair.codev@gmail.com',
  'Zair CodeV',
  'AMT-FRONTDESK',
  'Front Desk',
  'Administration',
  'Active'
)
ON CONFLICT (email) DO NOTHING;

-- Verify the user was added
SELECT id, email, name, role, status FROM employees WHERE email = 'zair.codev@gmail.com';

-- Success!
SELECT 'User zair.codev@gmail.com is now in employees table!' as message;
