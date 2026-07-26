# FIX: Supabase User Creation (No Email Redirect)

## ⚠️ Problem: "Invite" Button Redirects

When you click "Invite User", Supabase tries to send an email invitation. This causes a redirect and doesn't create the user immediately.

## ✅ Solution: Use "Create User" Instead

Follow these exact steps:

### Step 1: Go to Authentication

1. Open Supabase Dashboard: https://supabase.com
2. Select your project: `vvjjbjreauspzrweriof`
3. Click **"Authentication"** in left sidebar (🔐 lock icon)
4. Click **"Users"** tab

### Step 2: Add User (Correct Way)

1. Click **"Add User"** button (green button, top right)
2. You'll see a dropdown with TWO options:
   - ❌ "Invite user" (DON'T use this - it sends email)
   - ✅ **"Create new user"** (USE THIS ONE!)

### Step 3: Fill in Details

After clicking **"Create new user"**:

1. **Email**: `admin@amaltech.com`
2. **Password**: `Admin123!`
3. **Auto Confirm User**: ✅ **CHECK THIS BOX** (very important!)
4. Click **"Create User"**

### Step 4: Verify User Created

You should see the user appear in the list with:

- Email: admin@amaltech.com
- Status: ✅ Confirmed (green checkmark)

---

## Alternative: Disable Email Confirmation

If you keep having issues, disable email confirmation entirely:

### Option A: Turn Off Email Verification

1. Go to **Authentication** → **Settings** (in left sidebar)
2. Scroll to **"Email Auth"** section
3. Find **"Enable email confirmations"**
4. Toggle it **OFF** (disable)
5. Click **"Save"**

Now you can use either "Invite" or "Create" and it won't require email confirmation.

### Option B: Use SQL Editor

1. Go to **SQL Editor** in left sidebar
2. Click **"New Query"**
3. Paste this SQL:

```sql
-- Create admin user directly in auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@amaltech.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

4. Click **"Run"**
5. User is created instantly!

---

## Quick Test: Can You Login?

After creating the user, test immediately:

1. Open: **http://localhost:3000/auth/login**
2. Enter:
   - Email: `admin@amaltech.com`
   - Password: `Admin123!`
3. Click **"Sign In"**

### If Login Fails:

**Error: "Email not confirmed"**

- Go back to Supabase → Authentication → Users
- Find `admin@amaltech.com`
- Click the 3 dots (⋮) on the right
- Select **"Confirm email"**
- Try login again

**Error: "Invalid credentials"**

- Double-check email and password
- Make sure password is exactly: `Admin123!` (capital A, exclamation mark)
- Try creating a new user with different email

---

## Visual Guide: Where to Click

```
Supabase Dashboard
├── Authentication (click here)
│   ├── Users (click here)
│   │   └── Add User (green button)
│   │       ├── ❌ Invite user (DON'T CLICK)
│   │       └── ✅ Create new user (CLICK THIS!)
│   │           ├── Email: admin@amaltech.com
│   │           ├── Password: Admin123!
│   │           ├── ✅ Auto Confirm User (CHECK THIS!)
│   │           └── [Create User] (click)
```

---

## Still Having Issues?

If none of the above works, try this:

### Use Signup Page Instead:

1. Go to: **http://localhost:3000/auth/signup**
2. Create account directly in the app
3. Check your email for confirmation link
4. Click the link
5. Login at: http://localhost:3000/auth/login

---

## Summary

**The key issue**: You clicked "Invite user" instead of "Create new user"

**The fix**:

1. Click "Add User" dropdown
2. Select **"Create new user"** (not "Invite")
3. Check **"Auto Confirm User"**
4. Create user
5. Login at http://localhost:3000/auth/login

Let me know if you're still stuck! 🚀
