'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Exchanges Supabase `code` from email links (recovery/magic) for a session globally.
 * This allows reset links landing on any route (including "/") to work without
 * requiring a dedicated callback route.
 */
export function SessionBootstrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const code = searchParams?.get('code');
      if (!code) return;

      const supabase = createSupabaseBrowserClient();
      const { data: current } = await supabase.auth.getSession();
      if (current.session) return; // already authenticated

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      // Strip auth params from URL regardless of success to avoid repeated attempts
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.delete('code');
      params.delete('type');
      params.delete('access_token');
      params.delete('refresh_token');
      const nextParam = params.get('next');
      params.delete('next');

      if (cancelled) return;
      const newQuery = params.toString();
      const baseUrl = nextParam || pathname;
      router.replace(newQuery ? `${baseUrl}?${newQuery}` : baseUrl);

      // If this was a recovery link and no explicit next, prefer reset page
      const type = searchParams?.get('type');
      if (!error && type === 'recovery' && !nextParam) {
        router.replace('/reset-password');
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [pathname, router, searchParams]);

  return null;
}

