
'use client';

import React, { useMemo } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/contexts/auth-context';
import { useDues } from '@/contexts/dues-context';
import type { Due } from '@/lib/mock-data'; // Due definition
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { History, CalendarDays, School, Building, FileText } from 'lucide-react';

interface PaidDueEntry {
  dueDefinition: Due;
  paymentDate: string;
}

function PaymentHistoryContent() {
  const { user } = useAuth();
  const { dues: dueDefinitions, studentPayments, getDueById } = useDues();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
  };

  const paidDuesForStudent: PaidDueEntry[] = useMemo(() => {
    if (!user) return [];
    
    return studentPayments
      .filter(payment => payment.studentId === user.id)
      .map(payment => {
        const dueDefinition = getDueById(payment.dueId);
        return dueDefinition ? { dueDefinition, paymentDate: payment.paymentDate } : null;
      })
      .filter((entry): entry is PaidDueEntry => entry !== null) // Type guard to filter out nulls
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()); // Sort by most recent payment

  }, [user, studentPayments, getDueById]);

  const totalPaid = useMemo(() => {
    return paidDuesForStudent.reduce((sum, entry) => sum + entry.dueDefinition.amount, 0);
  }, [paidDuesForStudent]);

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Loading Payment History...</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Please ensure you are logged in to view your payment history.
            </p>
        </div>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <History className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-bold">Payment History</CardTitle>
        </div>
        <CardDescription>A record of all your completed payments, {user.name}.</CardDescription>
      </CardHeader>
      <CardContent>
        {paidDuesForStudent.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <Table>
              <TableCaption>End of your payment history.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Description</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidDuesForStudent.map((entry) => (
                  <TableRow key={`${entry.dueDefinition.id}-${entry.paymentDate}`}>
                    <TableCell className="font-medium">{entry.dueDefinition.description}</TableCell>
                    <TableCell><School className="inline h-4 w-4 mr-1 text-muted-foreground"/>{entry.dueDefinition.school}</TableCell>
                    <TableCell><Building className="inline h-4 w-4 mr-1 text-muted-foreground"/>{entry.dueDefinition.department}</TableCell>
                    <TableCell className="text-right font-mono">
                        {formatCurrency(entry.dueDefinition.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                        <CalendarDays className="inline h-4 w-4 mr-1 text-muted-foreground"/>
                        {new Date(entry.paymentDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-semibold text-lg">Total Paid</TableCell>
                  <TableCell className="text-right font-semibold text-lg font-mono">
                    {formatCurrency(totalPaid)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center min-h-[300px]">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No Payments Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven&apos;t made any payments yet. Paid dues will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PaymentHistoryPage() {
  return (
    <AuthGuard allowedRoles={['student']}>
      <div className="py-8">
        <PaymentHistoryContent />
      </div>
    </AuthGuard>
  );
}
