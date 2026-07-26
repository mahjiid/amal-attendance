-- Force confirm zair.codev@gmail.com and check their configuration
-- Run this in Supabase SQL Editor

-- 1. Force confirm the email in Supabase Auth (Corrected: only updating email_confirmed_at)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'zair.codev@gmail.com';

-- 2. Verify settings in employees table
UPDATE employees
SET role = 'Staff' -- Change to 'Staff' to ensure they see the staff dashboard
WHERE email = 'zair.codev@gmail.com';

-- 3. Check current status
SELECT u.email, u.email_confirmed_at, e.name, e.role, e.status
FROM auth.users u
JOIN employees e ON u.email = e.email
WHERE u.email = 'zair.codev@gmail.com';

-- SUCCESS MESSAGE
SELECT 'User zair.codev@gmail.com has been force-confirmed and role set to Staff!' as message;
