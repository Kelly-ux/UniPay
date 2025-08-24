
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailQuestion, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    console.log("Password reset requested for:", data.email);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast({
        title: 'Check your inbox!',
        description: `A password reset link has been sent to ${data.email} (mock).`,
      });
    }, 1000);
  };
  
  if (isSubmitted) {
     return (
       <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl text-center">
            <CardHeader>
                <div className="flex justify-center items-center mb-4">
                    <MailQuestion className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold">Email Sent</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    If an account with that email exists, we have sent a password reset link. Please check your inbox and spam folder.
                </p>
                <div className="mt-6">
                    {/* In a real app, this link would not exist. It's here for demo purposes. */}
                    <Link href="/reset-password">
                        <Button variant="secondary">
                            Proceed to Reset (Demo)
                        </Button>
                    </Link>
                </div>
            </CardContent>
             <CardFooter className="text-center text-sm">
                <Link href="/login" className="font-medium text-primary hover:underline flex items-center gap-2 mx-auto">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
            </CardFooter>
          </Card>
       </div>
     )
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <MailQuestion className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Forgot Your Password?</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a link to reset it.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Link...
                </>
              ) : (
                'Send Reset Link'
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
