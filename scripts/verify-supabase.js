
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (e) {
  console.error('Could not read .env.local', e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables.');
  process.exit(1);
}

console.log(`Connecting to Supabase: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const { data, error, count } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Connection failed:', error.message);
  } else {
    console.log('✅ Connection successful!');
    console.log(`✅ Found ${count} employees.`);
  }
}

verify();
