
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const ResetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();
  const code = typeof window !== 'undefined' ? (searchParams.get('code') || undefined) : undefined;

  // Ensure we have an auth session from the email link (tokens come in the URL hash)
  useEffect(() => {
    const ensureSessionFromUrl = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) return;
      if (typeof window === 'undefined') return;

      // Case 1: Supabase sends #access_token & #refresh_token
      const hash = window.location.hash || '';
      if (hash.startsWith('#')) {
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const type = params.get('type');
        if (type === 'recovery' && access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (!error) {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            return;
          }
        }
      }

      // Case 2: Supabase sends ?code=<token> (token hash)
      if (code) {
        const { error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: code });
        if (!error) {
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }
    };
    ensureSessionFromUrl();
  }, [supabase, code]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Auth session missing. Please open the reset link from your email.');
      }
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      toast({ title: 'Password Reset Successful!', description: 'You can now log in with your new password.' });
      router.push('/login');
    } catch (e: any) {
      toast({ title: 'Reset Failed', description: e.message || 'Invalid or expired reset link', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <KeyRound className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>Enter a new password for your account below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register('password')}
                className={form.formState.errors.password ? 'border-destructive' : ''}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...form.register('confirmPassword')}
                className={form.formState.errors.confirmPassword ? 'border-destructive' : ''}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </>
              ) : (
                'Set New Password'
              )}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="text-center text-sm">
          <Link href="/login" className="font-medium text-primary hover:underline flex items-center gap-2 mx-auto">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
