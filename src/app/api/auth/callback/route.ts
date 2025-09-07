import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Handles Supabase email links (magic link, recovery password reset, etc.)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const next = url.searchParams.get('next') || '/';

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || ''}/login?redirect=${encodeURIComponent(next)}&error=missing_token`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(tokenHash);
    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || ''}/login?redirect=${encodeURIComponent(next)}&error=exchange_failed`);
    }
    // After session is set via cookies, send user to the target page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || ''}${next}`);
  } catch {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || ''}/login?redirect=${encodeURIComponent(next)}&error=server_error`);
  }
}

