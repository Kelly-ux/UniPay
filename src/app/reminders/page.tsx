
"use client"; 

import { Suspense } from 'react';
import { ReminderForm } from '@/components/reminder-form';
import { useSearchParams } from 'next/navigation';
import type { ReminderFormValues } from '@/lib/schemas';
import { Skeleton } from "@/components/ui/skeleton";
import { AuthGuard } from '@/components/auth-guard';

function ReminderPageCore() {
  const searchParams = useSearchParams();

  const initialData: Partial<ReminderFormValues & { dueDate?: string }> = {
    studentName: searchParams.get('studentName') || '',
    dueAmount: searchParams.get('dueAmount') ? parseFloat(searchParams.get('dueAmount')!) : undefined,
    dueDate: searchParams.get('dueDate') ? new Date(searchParams.get('dueDate')!) : undefined,
    schoolName: searchParams.get('schoolName') || '',
    departmentName: searchParams.get('departmentName') || '',
    paymentMethod: searchParams.get('paymentMethod') || '',
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8 text-center">
        AI Payment Reminder Generator
      </h1>
      <ReminderForm initialData={initialData} />
    </div>
  );
}

function ReminderPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-10 w-3/4 mx-auto mb-8" />
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" /> {/* Card Header */}
        <div className="space-y-4 p-6 border rounded-md"> {/* Card Content */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" /> {/* Button */}
        </div>
      </div>
    </div>
  );
}

export default function PaymentRemindersPage() {
  return (
    <AuthGuard allowedRoles={['admin']}> {/* Or ['student', 'admin'] if students can also access */}
      <Suspense fallback={<ReminderPageSkeleton />}>
        <ReminderPageCore />
      </Suspense>
    </AuthGuard>
  );
}
