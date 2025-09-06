import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const signature = req.headers.get('verif-hash');
  const expected = process.env.FLW_WEBHOOK_HASH as string;
  if (!expected || signature !== expected) {
    return new NextResponse('Invalid signature', { status: 401 });
  }

  const payload = await req.json();
  const event = payload?.event;
  const data = payload?.data;

  // Accept only successful charges
  if (!data || data.status !== 'successful') {
    return NextResponse.json({ ok: true });
  }

  const meta = data?.meta || {};
  const txRef: string | undefined = data?.tx_ref;
  const dueId: string | undefined = meta.due_id || txRef?.split('_')[1];
  const userId: string | undefined = meta.user_id || txRef?.split('_')[2];
  const studentId: string | undefined = meta.student_id || null;

  if (!dueId || !userId) {
    return NextResponse.json({ ok: false, error: 'Missing dueId/userId' }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    await admin
      .from('payments')
      .insert({
        due_id: dueId,
        auth_user_id: userId,
        student_id: studentId,
      });
  } catch {}

  return NextResponse.json({ ok: true });
}

