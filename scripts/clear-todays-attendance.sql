-- Clear today's attendance for testing
-- Run this in Supabase SQL Editor to reset and test again

-- Option 1: Delete today's attendance for specific user
DELETE FROM attendance_logs 
WHERE employee_id = 20 -- Change this to your employee ID
AND date = CURRENT_DATE;

-- Option 2: Delete ALL today's attendance (use for testing only!)
-- DELETE FROM attendance_logs WHERE date = CURRENT_DATE;

-- Option 3: View today's attendance first
SELECT * FROM attendance_logs 
WHERE date = CURRENT_DATE
ORDER BY clock_in DESC;

-- After running, you can test the kiosk again!
