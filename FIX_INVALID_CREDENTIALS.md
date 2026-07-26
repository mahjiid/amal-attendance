# Fix: "Invalid login credentials" Error

You're seeing this error for miloboy188@gmail.com. Here's how to fix it:

## Solution 1: Confirm Email in Supabase (Most Likely Fix)

1. **Go to Supabase**: https://supabase.com
2. **Open your project**: vvjjbjreauspzrweriof
3. **Navigate to**: Authentication → Users
4. **Find**: miloboy188@gmail.com in the list
5. **Check the status**:
   - If it says "Unconfirmed" or has a ⚠️ icon → Click 3 dots (⋮) → "Confirm email"
   - If it says "Confirmed" → Go to Solution 2

6. **Try login again**: http://localhost:3000/auth/login

---

## Solution 2: Reset Your Password

If email is already confirmed but you still can't login:

1. **Go to**: http://localhost:3000/auth/forgot-password
2. **Enter**: miloboy188@gmail.com
3. **Check your email** for password reset link
4. **Create new password**
5. **Login again**

---

## Solution 3: Create Fresh Admin Account

If you're still stuck, create a new admin account:

1. **In Supabase**: Authentication → Users → Add User
2. **Select**: "Create new user" (NOT "Invite")
3. **Fill in**:
   - Email: admin@amaltech.com
   - Password: Admin123!
4. **✅ Check**: "Auto Confirm User"
5. **Click**: "Create User"
6. **Login at**: http://localhost:3000/auth/login with these credentials

---

## Quick Check: Is Your Account in Supabase?

Open Supabase and check if miloboy188@gmail.com appears in the Users list:

**If YES**:

- Check if it's confirmed
- If not, confirm it manually
- Try login again

**If NO**:

- The signup didn't work
- Create account via Supabase directly (Solution 3)

---

## Most Common Cause

Supabase requires email confirmation by default. Your account exists but isn't confirmed yet, so login fails with "Invalid credentials".

**Quick fix**: Just confirm the email in Supabase dashboard! ✅
