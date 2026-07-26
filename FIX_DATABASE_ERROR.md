# Fix Database Error - "Could not find 'clock_in' column"

## Problem

Your database has `check_in` and `check_out` columns, but the app code expects `clock_in` and `clock_out`.

## Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com
2. Open your project: `vvjjbjreauspzrweriof`
3. Click **"SQL Editor"** in left sidebar
4. Click **"New Query"**

### Step 2: Run This SQL

Copy and paste this into the SQL editor:

```sql
-- Rename columns to match what the app expects
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

Click the **"Run"** button (or press Ctrl+Enter)

### Step 4: Refresh Your App

1. Go back to: http://localhost:3000/dashboard
2. Refresh the page (F5)
3. ✅ Error should be gone!

---

## What This Does

- Renames `check_in` → `clock_in`
- Renames `check_out` → `clock_out`
- Adds columns for user authentication
- Adds location tracking columns
- Adds method column (Web/Kiosk)
- Creates indexes for better performance

---

## After Running This

Your app will work perfectly! You'll be able to:

- ✅ Clock in/out from dashboard
- ✅ View attendance history
- ✅ Track location
- ✅ Use kiosk mode

---

## Alternative: Use the SQL File

I've created a file: `scripts/fix-database-schema.sql`

You can also:

1. Open that file
2. Copy all the SQL
3. Paste into Supabase SQL Editor
4. Run it

Same result! ✅
