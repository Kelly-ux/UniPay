
"use client"; 

import { Suspense } from 'react';
import { ReminderForm } from '@/components/reminder-form';
import { useSearchParams } from 'next/navigation';
import type { ReminderFormValues } from '@/lib/schemas';
import { Skeleton } from "@/components/ui/skeleton";
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot } from 'lucide-react';

function GenerateReminderPageCore() {
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
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-bold">AI Payment Reminder Generator</CardTitle>
        </div>
        <CardDescription>
          Use this tool to generate personalized payment reminders for students. The form can be pre-filled by clicking &quot;Generate Reminder&quot; on a due card.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReminderForm initialData={initialData} />
      </CardContent>
    </Card>
  );
}

function GenerateReminderPageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto">
      <Skeleton className="h-10 w-3/4 mx-auto mb-8" /> {/* Title Skeleton */}
      <Card className="w-full shadow-xl">
        <CardHeader>
          <Skeleton className="h-8 w-1/2 mb-2" /> {/* Card Title Skeleton */}
          <Skeleton className="h-4 w-3/4" /> {/* Card Description Skeleton */}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" /> {/* Date Picker Skeleton */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" /> {/* Button Skeleton */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GeneratePaymentReminderPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="py-8">
        <Suspense fallback={<GenerateReminderPageSkeleton />}>
          <GenerateReminderPageCore />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
