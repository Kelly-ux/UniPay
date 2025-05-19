
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Due } from '@/lib/mock-data'; // Due is a Due Definition
import { CheckCircle, Download } from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  due: Due | null; // Due Definition
  studentName: string;
  paymentDate: string; // YYYY-MM-DD format
}

export function ReceiptModal({ isOpen, onClose, due, studentName, paymentDate }: ReceiptModalProps) {
  if (!due) return null;

  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(due.amount);
  const displayPaymentDate = paymentDate ? new Date(paymentDate + 'T00:00:00.000Z').toLocaleDateString() : 'N/A'; // Use UTC to avoid timezone issues
  const transactionId = `MOCK-${due.id}-${paymentDate ? new Date(paymentDate + 'T00:00:00.000Z').getTime() : new Date().getTime()}`;

  const generateReceiptContent = () => {
    return `
Payment Receipt
---------------------------------
Receipt For: ${due.description}
Student Name: ${studentName}
School: ${due.school}
Department: ${due.department}
Amount Paid: ${formattedAmount}
Payment Date: ${displayPaymentDate}
Transaction ID: ${transactionId}
---------------------------------
Thank you for your payment!
    `;
  };

  const handleDownload = () => {
    const receiptText = generateReceiptContent();
    const blob = new Blob([receiptText.trim()], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `UniPay_Receipt_${studentName.replace(/\s+/g, '_')}_${due.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Clean up
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <CheckCircle className="mr-2 h-7 w-7 text-accent" />
            Payment Successful
          </DialogTitle>
          <DialogDescription>
            Thank you for your payment, {studentName}. Here is a summary of your transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-semibold">Receipt For:</h4>
            <p>{due.description}</p>
          </div>
          <div>
            <h4 className="font-semibold">Student Name:</h4>
            <p>{studentName}</p>
          </div>
          <div>
            <h4 className="font-semibold">School & Department:</h4>
            <p>{due.school} - {due.department}</p>
          </div>
          <div>
            <h4 className="font-semibold">Amount Paid:</h4>
            <p className="text-primary font-bold">{formattedAmount}</p>
          </div>
          <div>
            <h4 className="font-semibold">Payment Date:</h4>
            <p>{displayPaymentDate}</p>
          </div>
          <div>
            <h4 className="font-semibold">Transaction ID:</h4>
            <p>{transactionId}</p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          <Button type="button" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

