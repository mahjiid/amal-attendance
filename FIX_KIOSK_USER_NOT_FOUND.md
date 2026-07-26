# Fix: "User Not Found" in Kiosk

## Problem

You're logged in with `miloboy188@gmail.com` but the kiosk says "User Not Found".

**Why?** The kiosk looks for users in the `employees` table, but your email only exists in Supabase Auth (authentication), not in the employees database table.

---

## Quick Fix (2 minutes)

### Option 1: Add Your Email to Employees Table

1. **Go to Supabase**: https://supabase.com
2. **Click**: SQL Editor → New Query
3. **Paste this SQL**:

```sql
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
```

4. **Click "Run"**
5. **Try kiosk again**: http://localhost:3000/kiosk
6. ✅ Should work now!

---

### Option 2: Use Existing Employee Email

Instead of using `miloboy188@gmail.com`, use one of the pre-loaded employee emails:

**Try these in the kiosk:**

- `farouq.a@amaltech.com`
- `fidelis.o@amaltech.com`
- `umar.s@amaltech.com`

These employees are already in the database, so the kiosk will recognize them.

---

## Why This Happens

Your system has two separate user systems:

1. **Supabase Auth** (for login)
   - miloboy188@gmail.com ✅ exists here
2. **Employees Table** (for attendance)
   - miloboy188@gmail.com ❌ doesn't exist here

The kiosk needs users to be in BOTH places.

---

## Long-Term Fix

I can modify the kiosk to:

1. Check if user exists in employees table
2. If not, automatically create an employee record
3. Then proceed with check-in

Would you like me to implement this?

---

## Quick Test

After running the SQL:

1. Go to: http://localhost:3000/kiosk
2. Enter: `miloboy188@gmail.com`
3. Click "Authorize Access"
4. ✅ Should work!

---

**Recommended**: Run Option 1 SQL now, then we can improve the system later!
