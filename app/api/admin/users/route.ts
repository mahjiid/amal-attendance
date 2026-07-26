import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabaseServer = await createClient();
    
    // Verify requester is an Admin or Superadmin
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminCheck } = await supabaseServer
      .from('employees')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminCheck || (adminCheck.role !== 'Admin' && adminCheck.role !== 'Superadmin')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Require Service Role Key to bypass user creation restrictions
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing from .env.local' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body = await request.json();
    const { users } = body; // Array of users

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Invalid payload: expected users array' }, { status: 400 });
    }

    const results = [];

    for (const u of users) {
      const { email, full_name, role, department } = u;
      
      if (!email || !full_name || !role || !department) {
        results.push({ email, success: false, error: 'Missing required fields' });
        continue;
      }

      // 1. Create Auth User
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: 'ChangeMe123!', // Default password
        email_confirm: true,
      });

      if (authError) {
        results.push({ email, success: false, error: authError.message });
        continue;
      }

      // 2. Create Employee Profile
      const { error: profileError } = await supabaseAdmin
        .from('employees')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: full_name,
          role: role,
          department: department,
          status: 'Active'
        });

      if (profileError) {
        results.push({ email, success: false, error: profileError.message });
        // Optionally, we could clean up the auth user here if profile creation fails
      } else {
        results.push({ email, success: true });
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error('Admin user creation error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}
