import { NextResponse } from 'next/server';

export async function GET() {
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasFlwSecret = Boolean(process.env.FLW_SECRET_KEY);
  const hasWebhookHash = Boolean(process.env.FLW_WEBHOOK_HASH);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || null;

  return NextResponse.json({
    ok: true,
    env: {
      hasSupabaseUrl,
      hasSupabaseAnon,
      hasFlwSecret,
      hasWebhookHash,
      appUrl,
    },
  });
}

