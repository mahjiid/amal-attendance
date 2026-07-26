# Quick Database Fix - Run This Now!

## The Error You're Seeing:

"Could not find the 'clock_in' column of 'attendance_logs' in the schema cache"

## The Fix (2 minutes):

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"**

### Step 2: Copy and Run This SQL

```sql
-- Fix column names
ALTER TABLE attendance_logs RENAME COLUMN check_in TO clock_in;
ALTER TABLE attendance_logs RENAME COLUMN check_out TO clock_out;

-- Add missing columns
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS user_id bigint REFERENCES auth.users(id);
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS location_lat decimal;
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS location_lng decimal;
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS method text DEFAULT 'Web';

-- Make employee_id nullable
ALTER TABLE attendance_logs ALTER COLUMN employee_id DROP NOT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attendance_logs_user_id ON attendance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_date ON attendance_logs(date);
```

### Step 3: Click "Run"

### Step 4: Test Kiosk Again

1. Go to: http://localhost:3000/kiosk
2. Enter: `miloboy188@gmail.com`
3. Click "Authorize Access"
4. ✅ **Should work now!**

---

## What This Does:

- Renames `check_in` → `clock_in` (what the code expects)
- Renames `check_out` → `clock_out`
- Adds columns for tracking location and method
- Links to auth users
- Improves performance with indexes

---

**This is the last database fix needed!** After this, everything should work smoothly! 🚀
