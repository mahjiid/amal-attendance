import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sdglipcumcjtqkiefqxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2xpcGN1bWNqdHFraWVmcXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MTg1NzMsImV4cCI6MjA5ODI5NDU3M30.uVhgtTFre-t6V-2r-ugKqj1SnJ0hn07UUbovDCNVzDE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    // Check if the user exists in employees
    const { data: empCheck } = await supabase.from('employees').select('*').eq('email', 'miloboy188@gmail.com').maybeSingle();
    
    if (empCheck) {
        console.log("Found existing record. Upgrading to Superadmin...");
        const { error } = await supabase.from('employees').update({ role: 'Superadmin' }).eq('email', 'miloboy188@gmail.com');
        if (error) console.error(error);
        else console.log("Success! Account is now Superadmin.");
    } else {
        console.log("No employee record found for miloboy188@gmail.com.");
        console.log("If they just signed up in Supabase but haven't logged into the app yet, they don't have an employee record.");
        console.log("They must log in once first for the auto-heal to create the record, or we must fetch their UUID from auth.users (requires service role key).");
    }
}

main();
