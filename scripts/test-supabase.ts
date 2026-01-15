
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables.');
  console.log('Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

console.log(`Connecting to Supabase: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConnection() {
  try {
    const { data, error, count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Connection failed:', error.message);
      if (error.code === 'PGRST301') { // Example error code
          console.log('Hint: Check if Row Level Security (RLS) policies are allowing access.');
      }
      return;
    }

    console.log('✅ Connection successful!');
    console.log(`✅ Found ${count} employees in the database.`);

    // Try to fetch one employee to be sure
    const { data: employees, error: fetchError } = await supabase
      .from('employees')
      .select('name, role')
      .limit(3);
    
    if (fetchError) {
        console.error('Error fetching data:', fetchError.message);
    } else {
        console.log('Sample Data:');
        console.table(employees);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

verifyConnection();
