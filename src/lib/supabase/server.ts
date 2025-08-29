import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createSupabaseServerClient() {
	const cookieStore = (await cookies()) as any;
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
	}
	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			get(name: string) {
				return cookieStore?.get?.(name)?.value;
			},
			set(name: string, value: string, options: any) {
				try {
					cookieStore?.set?.({ name, value, ...options });
				} catch {}
			},
			remove(name: string, options: any) {
				try {
					cookieStore?.set?.({ name, value: '', ...options });
				} catch {}
			},
		},
	});
}