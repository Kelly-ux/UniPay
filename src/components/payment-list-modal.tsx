
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { useDues } from '@/contexts/dues-context';
import type { Due, User } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PaymentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  dueDefinition: Due | null;
}

// In a real app, this data would come from your user management system/API
const mockUserDatabase: { [id: string]: Pick<User, 'name' | 'studentId'> } = {
  // This would be populated from your actual user data
};

export function PaymentListModal({ isOpen, onClose, dueDefinition }: PaymentListModalProps) {
  const { studentPayments } = useDues();
  // This state would be replaced by an API call
  const [payingStudents, setPayingStudents] = useState<Pick<User, 'id'|'name'|'studentId'>[]>([]);

  if (!dueDefinition) return null;

  const paymentsForThisDue = studentPayments.filter(p => p.dueId === dueDefinition.id);
  
  // This is a mock implementation of fetching user details for the payments.
  // In a real app, you would make an API call to get user details based on student IDs.
  useEffect(() => {
    // Simulating fetching user data.
    const userDetails = paymentsForThisDue.map(p => {
        // Find user in mock DB. In real app, this lookup would be an API call.
        const user = mockUserDatabase[p.studentId];
        return {
            id: p.studentId,
            name: user?.name || 'Unknown Student',
            studentId: user?.studentId || p.studentId
        };
    });
    // @ts-ignore
    setPayingStudents(userDetails);
  }, [paymentsForThisDue]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Payments for: {dueDefinition.description}</DialogTitle>
          </div>
          <DialogDescription>
            Students who have paid for this due ({dueDefinition.school} - {dueDefinition.department}).
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] mt-4 border rounded-md">
          {paymentsForThisDue.length > 0 ? (
            <Table>
              <TableCaption>Total {paymentsForThisDue.length} payment(s) for this due.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead className="text-right">Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsForThisDue.map(payment => (
                  <TableRow key={payment.studentId}>
                    <TableCell className="font-medium">{'Student Name' /* Replace with real name lookup */}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{payment.studentId}</TableCell>
                    <TableCell className="text-right">{new Date(payment.paymentDate + 'T00:00:00.000Z').toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-center text-muted-foreground py-4">No payments recorded for this due yet.</p>
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="mt-4">
            <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
