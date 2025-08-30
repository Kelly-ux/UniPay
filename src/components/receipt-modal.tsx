
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Due } from '@/lib/types';
import { CheckCircle, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  due: Due | null; // Due Definition
  studentName: string;
  studentId: string; // studentId is now required
  paymentDate: string; // YYYY-MM-DD format
}

export function ReceiptModal({ isOpen, onClose, due, studentName, studentId, paymentDate }: ReceiptModalProps) {
  if (!due) return null;

  const formattedAmount = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(due.amount);
  const displayPaymentDate = paymentDate ? new Date(paymentDate + 'T00:00:00.000Z').toLocaleDateString() : 'N/A';
  const transactionId = `DUE-${due.id}-${paymentDate ? new Date(paymentDate + 'T00:00:00.000Z').getTime() : new Date().getTime()}`;

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Payment Receipt", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("--------------------------------------------------------------------------------------------------", 10, 30);

    let yPos = 40;
    const lineHeight = 7;

    doc.text(`Receipt For: ${due.description}`, 10, yPos);
    yPos += lineHeight;
    doc.text(`Student Name: ${studentName}`, 10, yPos);
    yPos += lineHeight;
    doc.text(`Student ID: ${studentId}`, 10, yPos); // Add student ID to PDF
    yPos += lineHeight;
    doc.text(`School: ${due.school}`, 10, yPos);
    yPos += lineHeight;
    doc.text(`Department: ${due.department}`, 10, yPos);
    yPos += lineHeight;
    doc.text(`Amount Paid: ${formattedAmount}`, 10, yPos);
    yPos += lineHeight;
    doc.text(`Payment Date: ${displayPaymentDate}`, 10, yPos);
    yPos += lineHeight;
    doc.text(`Transaction ID: ${transactionId}`, 10, yPos);
    yPos += lineHeight * 2;
    
    doc.text("--------------------------------------------------------------------------------------------------", 10, yPos);
    yPos += lineHeight;
    doc.text("Thank you for your payment!", 105, yPos, { align: "center" });

    doc.save(`DuesPay_Receipt_${studentName.replace(/\s+/g, '_')}_${due.id}.pdf`);
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
            <h4 className="font-semibold">Student ID:</h4>
            <p className="font-mono text-muted-foreground">{studentId}</p>
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
          <Button type="button" variant="outline" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF Receipt
          </Button>
          <Button type="button" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
