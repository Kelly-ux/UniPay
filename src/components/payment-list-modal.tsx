
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { useDues } from '@/contexts/dues-context';
import type { Due } from '@/lib/mock-data';
import { getStudentDisplayNameFromId } from '@/lib/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';

interface PaymentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  dueDefinition: Due | null;
}

export function PaymentListModal({ isOpen, onClose, dueDefinition }: PaymentListModalProps) {
  const { studentPayments } = useDues();

  if (!dueDefinition) return null;

  const paymentsForThisDue = studentPayments.filter(p => p.dueId === dueDefinition.id);

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
                  <TableHead>Student Name / ID</TableHead>
                  <TableHead className="text-right">Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsForThisDue.map(payment => (
                  <TableRow key={payment.studentId}>
                    <TableCell className="font-medium">{getStudentDisplayNameFromId(payment.studentId)}</TableCell>
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
