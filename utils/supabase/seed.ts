
import { createClient } from './client';
import { employees } from '@/lib/data';

export async function seedDatabase() {
  const supabase = createClient();

  // 1. Seed Employees
  console.log('Seeding employees...');
  const { error: empError } = await supabase
    .from('employees')
    .upsert(
      employees.map(e => ({
        // We use a random UUID for the ID since Supabase expects UUIDs, 
        // but our mock data has numbers. We'll let Supabase generate them 
        // or we need to map them. 
        // Strategy: For this migration, we will insert ignoring conflict if email matches.
        email: e.email,
        full_name: e.name,
        role: e.role,
        department: e.department,
        status: e.status
      })),
      { onConflict: 'email' }
    );

  if (empError) console.error('Error seeding employees:', empError);
  else console.log('Employees seeded successfully.');
}
