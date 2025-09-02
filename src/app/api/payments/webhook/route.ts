import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyFlutterwaveTransaction } from '@/lib/flutterwave';

export async function POST(req: NextRequest) {
  const webhookHash = process.env.FLW_WEBHOOK_HASH;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!webhookHash || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const signature = req.headers.get('verif-hash') || req.headers.get('verif_hash');
  if (!signature || signature !== webhookHash) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = await req.json();
  try {
    const event = payload?.event;
    const data = payload?.data;
    if (event !== 'charge.completed' || !data) {
      return NextResponse.json({ ok: true });
    }

    // Verify with Flutterwave to be safe
    const txId = data?.id;
    const verification = await verifyFlutterwaveTransaction(txId);
    const v = verification?.data;
    if (!v || v.status !== 'successful') {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    const txRef: string = v.tx_ref;
    const currency: string = v.currency;
    const paidAmount: number = Number(v.amount);

    const service = createClient(supabaseUrl, serviceKey);

    // Find intent
    const { data: intent } = await service
      .from('payment_intents')
      .select('*')
      .eq('tx_ref', txRef)
      .maybeSingle();

    // If we cannot find intent, we still attempt to record payment with meta in verification
    const dueId = intent?.due_id || v.meta?.due_id || v.meta?.custom_fields?.due_id;
    const authUserId = intent?.auth_user_id || v.meta?.auth_user_id || v.meta?.customer?.id;
    const academicStudentId = intent?.academic_student_id || null;

    if (!dueId || !authUserId) {
      // Missing critical mapping
      return NextResponse.json({ error: 'Missing due or user mapping' }, { status: 400 });
    }

    // Insert into payments if not exists (manual idempotency to avoid impacting existing schema)
    const { data: already } = await service
      .from('payments')
      .select('id')
      .eq('due_id', dueId)
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (!already) {
      await service
        .from('payments')
        .insert({
          due_id: dueId,
          auth_user_id: authUserId,
          student_id: academicStudentId,
          payment_date: new Date().toISOString().split('T')[0],
        });
    }

    // Update intent
    if (intent) {
      await service
        .from('payment_intents')
        .update({
          status: 'SUCCEEDED',
          flw_tx_id: String(v.id),
          paid_amount: paidAmount,
          currency,
        })
        .eq('tx_ref', txRef);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

