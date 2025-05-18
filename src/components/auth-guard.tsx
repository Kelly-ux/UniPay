
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Frown } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'student' | 'admin'>;
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/'); // Or an "Access Denied" page
    }
  }, [user, isLoading, router, pathname, allowedRoles]);

  if (isLoading || (!user && pathname !== '/login' && pathname !== '/signup')) { // Allow signup page if it exists
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-1/4" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          <Skeleton className="h-12 w-full sm:col-span-2 lg:col-span-4 xl:col-span-1" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-full mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-destructive p-12 text-center h-96">
        <Frown className="mx-auto h-16 w-16 text-destructive" />
        <h3 className="mt-4 text-2xl font-semibold text-destructive">Access Denied</h3>
        <p className="mt-2 text-md text-muted-foreground">
          You do not have permission to view this page. Redirecting...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
