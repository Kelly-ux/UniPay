
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { useDues } from '@/contexts/dues-context';
import type { Due } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface PaymentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  dueDefinition: Due | null;
}

interface PaymentRowUI {
  studentAuthId: string;
  studentName: string;
  studentId: string;
  paymentDate: string;
}

export function PaymentListModal({ isOpen, onClose, dueDefinition }: PaymentListModalProps) {
  const { studentPayments } = useDues();
  const [rows, setRows] = useState<PaymentRowUI[]>([]);

  const paymentsForThisDue = useMemo(() => {
    if (!dueDefinition) return [];
    return studentPayments.filter(p => p.dueId === dueDefinition.id);
  }, [dueDefinition, studentPayments]);

  useEffect(() => {
    const load = async () => {
      if (!dueDefinition) return;
      const supabase = createSupabaseBrowserClient();
      const authIds = Array.from(new Set(paymentsForThisDue.map(p => p.studentId)));
      if (authIds.length === 0) { setRows([]); return; }
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, student_id')
        .in('id', authIds);
      const map = new Map<string, { name: string | null; student_id: string | null }>();
      (profiles || []).forEach((p: any) => map.set(p.id, { name: p.name, student_id: p.student_id }));
      const enriched = paymentsForThisDue.map(p => {
        const prof = map.get(p.studentId);
        return {
          studentAuthId: p.studentId,
          studentName: (prof?.name || p.studentId),
          studentId: (prof?.student_id || p.studentId),
          paymentDate: p.paymentDate,
        } as PaymentRowUI;
      });
      setRows(enriched);
    };
    load();
  }, [dueDefinition, paymentsForThisDue]);

  if (!dueDefinition) return null;

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
          {rows.length > 0 ? (
            <Table>
              <TableCaption>Total {rows.length} payment(s) for this due.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead className="text-right">Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.studentAuthId}>
                    <TableCell className="font-medium">{r.studentName}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{r.studentId}</TableCell>
                    <TableCell className="text-right">{new Date(r.paymentDate + 'T00:00:00.000Z').toLocaleDateString()}</TableCell>
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

