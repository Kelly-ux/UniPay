"use client"; // This page uses client hooks for searchParams

import { Suspense } from 'react';
import { ReminderForm } from '@/components/reminder-form';
import { useSearchParams } from 'next/navigation';
import type { ReminderFormValues } from '@/lib/schemas';
import { Skeleton } from "@/components/ui/skeleton";

function ReminderPageContent() {
  const searchParams = useSearchParams();

  const initialData: Partial<ReminderFormValues & { dueDate?: string }> = { // dueDate can be string from query
    studentName: searchParams.get('studentName') || '',
    dueAmount: searchParams.get('dueAmount') ? parseFloat(searchParams.get('dueAmount')!) : undefined,
    dueDate: searchParams.get('dueDate') || undefined, // Pass as string, form will convert to Date
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


export default function PaymentRemindersPage() {
  return (
    // Suspense is required by Next.js when using useSearchParams at the page level
    <Suspense fallback={<ReminderPageSkeleton />}>
      <ReminderPageContent />
    </Suspense>
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
