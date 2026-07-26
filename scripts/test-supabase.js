/**
 * Test script to verify Supabase connection
 * Run this to check if your Supabase credentials are working
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Expected:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

console.log('✅ Supabase URL:', supabaseUrl);
console.log('✅ Supabase Key:', supabaseKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check employees table
    console.log('📊 Test 1: Checking employees table...');
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .limit(5);

    if (empError) {
      console.error('❌ Error fetching employees:', empError.message);
    } else {
      console.log(`✅ Found ${employees.length} employees`);
      if (employees.length > 0) {
        console.log('   Sample:', employees[0].name, `(${employees[0].staff_id})`);
      }
    }

    // Test 2: Check attendance logs
    console.log('\n📊 Test 2: Checking attendance logs...');
    const { data: logs, error: logError } = await supabase
      .from('attendance_logs')
      .select('*')
      .limit(5);

    if (logError) {
      console.error('❌ Error fetching logs:', logError.message);
    } else {
      console.log(`✅ Found ${logs.length} attendance logs`);
    }

    // Test 3: Check auth users
    console.log('\n📊 Test 3: Checking authentication...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log('⚠️  Cannot list users (admin access required)');
      console.log('   This is normal - you can still login via the app');
    } else {
      console.log(`✅ Found ${users.length} authenticated users`);
      if (users.length > 0) {
        console.log('   Users:', users.map(u => u.email).join(', '));
      } else {
        console.log('   ⚠️  No users found - you need to create an admin account!');
      }
    }

    console.log('\n✅ Connection test complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Create admin user in Supabase dashboard');
    console.log('   2. Go to: http://localhost:3000/auth/login');
    console.log('   3. Login with your credentials');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();
