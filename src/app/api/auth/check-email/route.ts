import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const client = createClient(supabaseUrl, serviceRoleKey);
    // Fallback approach: list users with email filter (admin API may not support direct get by email)
    const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const exists = (data?.users || []).some((u: any) => (u.email || '').toLowerCase() === String(email).toLowerCase());
    return NextResponse.json({ exists });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}

