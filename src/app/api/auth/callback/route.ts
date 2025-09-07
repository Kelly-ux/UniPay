import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?redirect=${encodeURIComponent(next)}&error=missing_code`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${appUrl}/login?redirect=${encodeURIComponent(next)}&error=exchange_failed`);
    }
    return NextResponse.redirect(`${appUrl}${next}`);
  } catch {
    return NextResponse.redirect(`${appUrl}/login?redirect=${encodeURIComponent(next)}&error=server_error`);
  }
}

