
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const SignupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['student', 'admin'], { required_error: 'Please select a role.' }),
  studentId: z.string().optional(),
}).refine(data => {
    // Student ID is required only if the role is 'student'
    return data.role !== 'student' || (data.role === 'student' && data.studentId && data.studentId.trim().length > 0);
}, {
    message: "Student ID is required for the student role.",
    path: ["studentId"], // path of error
});

type SignupFormValues = z.infer<typeof SignupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
      studentId: '',
    },
  });

  const selectedRole = form.watch('role');

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
          data: {
            name: data.name,
            studentId: data.role === 'student' ? (data.studentId || '') : '',
            requestedRole: data.role,
          },
        },
      });
      if (signUpErr) throw signUpErr;

      const authUser = signUp.user;
      if (!authUser) throw new Error('Signup succeeded but no user returned');

      // IMPORTANT: Do NOT grant admin from client signup.
      // Prefer a DB trigger to create the profile row.
      // If a session exists (email confirmations disabled), update the profile with name/student_id.
      if (signUp.session) {
        const { error: profileUpdateErr } = await supabase
          .from('profiles')
          .update({
            name: data.name,
            student_id: data.role === 'student' ? data.studentId || null : null,
            pending_admin: data.role === 'admin' ? true : false,
          })
          .eq('id', authUser.id);
        if (profileUpdateErr) throw profileUpdateErr;
      }

      // If email confirmations are enabled in Supabase, user must confirm first
      toast({
        title: 'Account Created',
        description: data.role === 'admin'
          ? 'Please verify your email. Your admin access request is pending approval.'
          : 'Please verify your email, then log in.',
      });
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <UserPlus className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
          <CardDescription>Join DuesPay to manage your payments with ease.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/20 text-destructive border border-destructive rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                {...form.register('name')}
                className={form.formState.errors.name ? 'border-destructive' : ''}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                {...form.register('email')}
                className={form.formState.errors.email ? 'border-destructive' : ''}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
              <Label htmlFor="role">Role</Label>
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="role" className={form.formState.errors.role ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.role && (
                <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
              )}
            </div>
            
            {selectedRole === 'student' && (
               <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="UENR12345678"
                  {...form.register('studentId')}
                  className={form.formState.errors.studentId ? 'border-destructive' : ''}
                />
                {form.formState.errors.studentId && (
                  <p className="text-sm text-destructive">{form.formState.errors.studentId.message}</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
