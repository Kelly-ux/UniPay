
'use client';

import React, { useMemo } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/contexts/auth-context';
import { useDues } from '@/contexts/dues-context';
import type { Due } from '@/lib/mock-data';
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
import { History, DollarSign, CalendarDays, School, Building, FileText } from 'lucide-react';

function PaymentHistoryContent() {
  const { user } = useAuth();
  const { dues } = useDues();

  const paidDues = useMemo(() => {
    if (!user) return [];
    return dues.filter(
      (due) => due.status === 'Paid' && due.studentName === user.name // Assuming user.name matches due.studentName
    ).sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime()); // Sort by most recent payment
  }, [user, dues]);

  const totalPaid = useMemo(() => {
    return paidDues.reduce((sum, due) => sum + due.amount, 0);
  }, [paidDues]);

  if (!user) {
    // This case should ideally be handled by AuthGuard, but as a fallback:
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
        {paidDues.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-20rem)]"> {/* Adjust height as needed */}
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
                {paidDues.map((due) => (
                  <TableRow key={due.id}>
                    <TableCell className="font-medium">{due.description}</TableCell>
                    <TableCell><School className="inline h-4 w-4 mr-1 text-muted-foreground"/>{due.school}</TableCell>
                    <TableCell><Building className="inline h-4 w-4 mr-1 text-muted-foreground"/>{due.department}</TableCell>
                    <TableCell className="text-right">
                        <DollarSign className="inline h-4 w-4 mr-1 text-green-600"/>
                        {due.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                        <CalendarDays className="inline h-4 w-4 mr-1 text-muted-foreground"/>
                        {due.paymentDate ? new Date(due.paymentDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-semibold text-lg">Total Paid</TableCell>
                  <TableCell className="text-right font-semibold text-lg">
                    <DollarSign className="inline h-5 w-5 mr-1 text-green-600"/>
                    {totalPaid.toFixed(2)}
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
