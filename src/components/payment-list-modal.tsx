
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
import * as XLSX from 'xlsx';

interface PaymentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  dueDefinition: Due | null;
}

interface PaymentRowUI {
  studentAuthId: string;
  studentName: string;
  studentId: string;
  studentEmail?: string | null;
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
      const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const emailById = new Map<string, string | null>();
      (users?.users || []).forEach((u: any) => emailById.set(u.id, u.email || null));
      const map = new Map<string, { name: string | null; student_id: string | null; email: string | null }>();
      (profiles || []).forEach((p: any) => map.set(p.id, { name: p.name, student_id: p.student_id, email: emailById.get(p.id) || null }));
      const enriched = paymentsForThisDue.map(p => {
        const prof = map.get(p.studentId);
        return {
          studentAuthId: p.studentId,
          studentName: (prof?.name || p.studentId),
          studentId: (prof?.student_id || p.studentId),
          studentEmail: prof?.email || null,
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
        <div className="flex items-center justify-end gap-2 mt-2">
          <ExportButtons rows={rows} due={dueDefinition} />
        </div>
        <ScrollArea className="h-[300px] mt-2 border rounded-md">
          {rows.length > 0 ? (
            <Table>
              <TableCaption>Total {rows.length} payment(s) for this due.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.studentAuthId}>
                    <TableCell className="font-medium">{r.studentName}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{r.studentId}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{r.studentEmail || '-'}</TableCell>
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

function ExportButtons({ rows, due }: { rows: PaymentRowUI[]; due: Due }) {
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | 'pdf' | null>(null);
  const filenameBase = `${due.description.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\//g, '-')}`;

  const buildData = () => rows.map(r => ({
    'Student Name': r.studentName,
    'Student ID': r.studentId,
    'Student Email': r.studentEmail || '',
    'Payment Date': new Date(r.paymentDate + 'T00:00:00.000Z').toLocaleDateString(),
    'Due Description': due.description,
    'School': due.school,
    'Department': due.department,
  }));

  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    setExporting('csv');
    try {
      const data = buildData();
      const headers = ['Student Name','Student ID','Student Email','Payment Date','Due Description','School','Department'] as const;
      const csv = [headers.join(','), ...data.map((row) => (
        [row['Student Name'], row['Student ID'], row['Student Email'], row['Payment Date'], row['Due Description'], row['School'], row['Department']]
          .map(v => JSON.stringify(v ?? ''))
          .join(',')
      ))].join('\n');
      download(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filenameBase}.csv`);
    } finally {
      setExporting(null);
    }
  };

  const exportXLSX = () => {
    setExporting('xlsx');
    try {
      const data = buildData();
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Payments');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      download(new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${filenameBase}.xlsx`);
    } finally {
      setExporting(null);
    }
  };

  const exportPDF = async () => {
    setExporting('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(`Payments for: ${due.description}`, 10, 15);
      doc.setFontSize(10);
      const startY = 25;
      const lineHeight = 6;
      let y = startY;
      rows.forEach((r, idx) => {
        const line = `${idx + 1}. ${r.studentName} | ${r.studentId} | ${r.studentEmail || ''} | ${new Date(r.paymentDate + 'T00:00:00.000Z').toLocaleDateString()}`;
        doc.text(line, 10, y);
        y += lineHeight;
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
      });
      doc.save(`${filenameBase}.pdf`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={exportCSV} disabled={exporting !== null}>Export CSV</Button>
      <Button size="sm" variant="outline" onClick={exportXLSX} disabled={exporting !== null}>Export XLSX</Button>
      <Button size="sm" variant="outline" onClick={exportPDF} disabled={exporting !== null}>Export PDF</Button>
    </div>
  );
}

