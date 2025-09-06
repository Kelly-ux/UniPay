import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createFlutterwavePaymentLink } from '@/lib/payments/flutterwave';

export async function POST(req: Request) {
  try {
    // Basic env checks for clearer errors
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const flwSecret = process.env.FLW_SECRET_KEY;
    if (!supabaseUrl || !supabaseAnon) {
      return NextResponse.json({ error: 'Server not configured: Supabase env missing' }, { status: 500 });
    }
    if (!flwSecret) {
      return NextResponse.json({ error: 'Server not configured: FLW_SECRET_KEY missing' }, { status: 500 });
    }
    const { dueId } = await req.json();
    if (!dueId || typeof dueId !== 'string') {
      return NextResponse.json({ error: 'Missing dueId' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = authData.user;

    const { data: due, error: dueErr } = await supabase
      .from('dues')
      .select('*')
      .eq('id', dueId)
      .single();
    if (dueErr || !due) {
      return NextResponse.json({ error: 'Due not found' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const currency = 'GHS';
    const amount = due.amount as number;
    const txRef = `DUESPAY_${due.id}_${user.id}_${Date.now()}`;

    const paymentLink = await createFlutterwavePaymentLink({
      amount,
      currency,
      email: user.email || 'no-email@example.com',
      name: (profile as any)?.name ?? null,
      txRef,
      meta: {
        due_id: due.id,
        user_id: user.id,
        student_id: (profile as any)?.student_id ?? null,
        amount,
        currency,
      },
    });

    return NextResponse.json({ link: paymentLink });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

