
"use client"; 

import { Suspense } from 'react';
import { ReminderForm } from '@/components/reminder-form';
import { useSearchParams } from 'next/navigation';
import type { ReminderFormValues } from '@/lib/schemas'; // ReminderFormValues might need an update if studentName is optional
import { Skeleton } from "@/components/ui/skeleton";
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot } from 'lucide-react';

function GenerateReminderPageCore() {
  const searchParams = useSearchParams();

  // studentName is now optional for the AI flow.
  // The form itself might still require it if it's for a specific student,
  // or it could be made optional in ReminderFormSchema too.
  // For now, keeping ReminderFormSchema as is, but AI flow handles optional studentName.
  // The link from DueCard now omits studentName, so it will be empty here.
  const initialData: Partial<ReminderFormValues & { dueDate?: string, description?: string }> = {
    studentName: searchParams.get('studentName') || '', // Will be empty if coming from new DueCard link
    dueAmount: searchParams.get('dueAmount') ? parseFloat(searchParams.get('dueAmount')!) : undefined,
    dueDate: searchParams.get('dueDate') ? new Date(searchParams.get('dueDate')!) : undefined,
    schoolName: searchParams.get('schoolName') || '',
    departmentName: searchParams.get('departmentName') || '',
    paymentMethod: searchParams.get('paymentMethod') || '',
    description: searchParams.get('description') || '', // Added description
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-bold">AI Payment Reminder Generator</CardTitle>
        </div>
        <CardDescription>
          Use this tool to generate payment reminders. The form can be pre-filled by clicking &quot;Generate Reminder&quot; on a due card.
          If Student Name is left blank, a general reminder for the department will be generated.
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
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-bold">AI Payment Reminder Generator</CardTitle>
        </div>
        <CardDescription>
          Use this tool to generate payment reminders. The form can be pre-filled by clicking &quot;Generate Reminder&quot; on a due card.
          If Student Name is left blank, a general reminder for the department will be generated.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div>
            </div>
            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div>
                 <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div>
            </div>
            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
            <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
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
