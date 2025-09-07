import { NextResponse } from 'next/server';
import { verifyFlutterwaveTransaction } from '@/lib/payments/flutterwave';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const transactionId = url.searchParams.get('transaction_id');
  const status = url.searchParams.get('status');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const redirectBase = appUrl || `${url.protocol}//${url.host}` || '/';

  if (!transactionId || status !== 'successful') {
    return NextResponse.redirect(`${redirectBase}/payment-history?status=failed`, { status: 302 });
  }

  try {
    const data = await verifyFlutterwaveTransaction(transactionId);
    if (data.status !== 'successful') {
      return NextResponse.redirect(`${redirectBase}/payment-history?status=failed`, { status: 302 });
    }

    const meta = (data as any)?.meta || {};
    const dueId: string | undefined = meta.due_id || (data.tx_ref?.split('_')[1]);
    const userId: string | undefined = meta.user_id || (data.tx_ref?.split('_')[2]);
    const studentId: string | undefined = meta.student_id || null;

    if (!dueId || !userId) {
      return NextResponse.redirect(`${redirectBase}/payment-history?status=failed`, { status: 302 });
    }

    const admin = createSupabaseAdminClient();
    // Insert payment record; ignore duplicate errors
    await admin
      .from('payments')
      .insert({
        due_id: dueId,
        auth_user_id: userId,
        student_id: studentId,
      });

    return NextResponse.redirect(`${redirectBase}/payment-history?status=success`, { status: 302 });
  } catch (err) {
    return NextResponse.redirect(`${redirectBase}/payment-history?status=failed`, { status: 302 });
  }
}

