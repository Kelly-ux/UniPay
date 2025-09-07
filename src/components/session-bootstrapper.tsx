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
      const supabase = createSupabaseBrowserClient();
      const { data: current } = await supabase.auth.getSession();
      if (current.session) return;

      // Read from both query and hash (Supabase may put tokens in the hash)
      let hashParams: URLSearchParams | null = null;
      if (typeof window !== 'undefined' && window.location.hash) {
        const raw = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
        hashParams = new URLSearchParams(raw);
      }

      const getParam = (key: string) => searchParams?.get(key) || hashParams?.get(key) || null;

      const code = getParam('code');
      const accessToken = getParam('access_token');
      const refreshToken = getParam('refresh_token');
      const type = getParam('type');
      const email = getParam('email');

      let error: any = null;
      if (code) {
        // Prefer recovery verification if we have an email (type may be missing in some templates)
        if (email) {
          const v = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: code, email });
          error = v.error;
          if (error) {
            const ex = await supabase.auth.exchangeCodeForSession(code);
            error = ex.error;
          }
        } else if (type === 'recovery') {
          const v = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: code, email: undefined });
          error = v.error;
          if (error) {
            const ex = await supabase.auth.exchangeCodeForSession(code);
            error = ex.error;
          }
        } else {
          const ex = await supabase.auth.exchangeCodeForSession(code);
          error = ex.error;
        }
      } else if (accessToken && refreshToken) {
        const res = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        error = res.error;
      } else {
        return;
      }

      // Clean URL
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.delete('code');
      params.delete('type');
      params.delete('access_token');
      params.delete('refresh_token');
      const nextParam = params.get('next');
      params.delete('next');

      // Also clear hash tokens if present
      if (typeof window !== 'undefined' && hashParams) {
        hashParams.delete('code');
        hashParams.delete('type');
        hashParams.delete('access_token');
        hashParams.delete('refresh_token');
      }

      if (cancelled) return;
      const newQuery = params.toString();
      const baseUrl = nextParam || pathname;
      router.replace(newQuery ? `${baseUrl}?${newQuery}` : baseUrl);

      const recoveryType = searchParams?.get('type') || hashParams?.get('type');
      if (!error && recoveryType === 'recovery' && !nextParam) {
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

