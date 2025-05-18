
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Due } from '@/lib/mock-data';
import { CheckCircle, Download } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  due: Due | null;
}

export function ReceiptModal({ isOpen, onClose, due }: ReceiptModalProps) {
  if (!due) return null;

  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(due.amount);
  const paymentDate = due.paymentDate ? new Date(due.paymentDate).toLocaleDateString() : 'N/A';

  // Mock print/download function
  const handlePrint = () => {
    alert("Printing/Downloading receipt... (This is a mock function)");
    // In a real app, you would generate a PDF or open print dialog
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
            Thank you for your payment. Here is a summary of your transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-semibold">Receipt For:</h4>
            <p>{due.description}</p>
          </div>
          <div>
            <h4 className="font-semibold">Student Name:</h4>
            <p>{due.studentName}</p>
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
            <p>{paymentDate}</p>
          </div>
          <div>
            <h4 className="font-semibold">Transaction ID:</h4>
            <p>MOCK-{due.id}-{new Date().getTime()}</p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Print/Download
          </Button>
          <Button type="button" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
