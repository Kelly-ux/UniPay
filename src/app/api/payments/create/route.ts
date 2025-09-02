import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createFlutterwaveCheckout, computeSurchargedAmount } from '@/lib/flutterwave';

export async function POST(req: NextRequest) {
  try {
    const { dueId } = await req.json();
    if (!dueId || typeof dueId !== 'string') {
      return NextResponse.json({ error: 'Invalid dueId' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!appUrl || !supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Identify current user via Supabase SSR client
    const supabaseSSR = await createSupabaseServerClient();
    const { data: auth } = await supabaseSSR.auth.getUser();
    const authUser = auth?.user;
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = createClient(supabaseUrl, serviceKey);

    // Fetch due details
    const { data: due, error: dueErr } = await service.from('dues').select('*').eq('id', dueId).maybeSingle();
    if (dueErr || !due) {
      return NextResponse.json({ error: 'Due not found' }, { status: 404 });
    }

    // Prevent duplicate payment
    const { data: existing } = await service
      .from('payments')
      .select('id')
      .eq('due_id', dueId)
      .eq('auth_user_id', authUser.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'You already paid this due' }, { status: 409 });
    }

    // Get profile for name and optional academic student id
    const { data: profile } = await service
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    // Compute surcharge
    const baseAmount: number = due.amount;
    const { totalAmount, surchargeAmount } = computeSurchargedAmount(baseAmount);

    // Build tx reference
    const random = Math.random().toString(36).slice(2, 8);
    const txRef = `${dueId}-${authUser.id}-${random}`;

    const paymentOptions = 'card,mobilemoneyghana,banktransfer';
    const redirectUrl = `${appUrl}/payments/callback`;

    const { link } = await createFlutterwaveCheckout({
      amount: totalAmount,
      currency: 'GHS',
      txRef,
      redirectUrl,
      paymentOptions,
      customer: {
        email: authUser.email || 'no-email@local',
        name: profile?.name || authUser.email?.split('@')[0] || 'Student',
      },
      meta: {
        due_id: dueId,
        auth_user_id: authUser.id,
        base_amount: baseAmount,
        surcharge_amount: surchargeAmount,
        school: due.school,
        department: due.department,
        description: due.description,
      },
    });

    // Record intent
    await service.from('payment_intents').insert({
      tx_ref: txRef,
      due_id: dueId,
      auth_user_id: authUser.id,
      academic_student_id: profile?.student_id || null,
      base_amount: baseAmount,
      total_amount: totalAmount,
      currency: 'GHS',
      status: 'PENDING',
      checkout_url: link,
    });

    return NextResponse.json({ link });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

