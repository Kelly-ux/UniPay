
"use client";

import type { Due, DueStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Info, Cpu, CalendarDays, CreditCard, Trash2, Eye } from 'lucide-react';
import { AppLogo } from '@/components/app-logo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useDues } from '@/contexts/dues-context';
import React, { useState, useMemo } from 'react';
import { ReceiptModal } from './receipt-modal';
import { PaymentListModal } from './payment-list-modal';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns'; 

interface DueCardProps {
  due: Due;
}

const statusStyles: Record<DueStatus, { icon: React.ElementType; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined, iconColorClass: string }> = {
  Paid: { icon: CheckCircle2, badgeVariant: 'default', iconColorClass: 'text-green-400' },
  Unpaid: { icon: Info, badgeVariant: 'secondary', iconColorClass: 'text-yellow-400' },
  Overdue: { icon: AlertTriangle, badgeVariant: 'destructive', iconColorClass: 'text-red-400' },
};


export function DueCard({ due }: DueCardProps) {
  const { user } = useAuth();
  const { recordStudentPayment, hasStudentPaid, getStudentPaymentDate, removeDue } = useDues();
  
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptStudentName, setReceiptStudentName] = useState<string | null>(null);
  const [receiptStudentId, setReceiptStudentId] = useState<string | null>(null);
  const [receiptDueDetails, setReceiptDueDetails] = useState<Due | null>(null);

  const [isPaymentListModalOpen, setIsPaymentListModalOpen] = useState(false);
  const [selectedDueForPaymentList, setSelectedDueForPaymentList] = useState<Due | null>(null);

  const createUTCDate = (dateString: string) => {
    if (dateString.includes('T')) {
        return new Date(dateString);
    }
    return new Date(dateString + 'T00:00:00.000Z');
  };

  const studentHasPaid = useMemo(() => {
    if (!user || user.role !== 'student') return false;
    return hasStudentPaid(due.id, user.id);
  }, [due.id, user, hasStudentPaid]);

  const paymentDateForStudent = useMemo(() => {
    if (!user || !studentHasPaid) return undefined;
    return getStudentPaymentDate(due.id, user.id);
  }, [due.id, user, studentHasPaid, getStudentPaymentDate]);

  const currentStatus: DueStatus = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dueDateObj = createUTCDate(due.dueDate);
    
    if (user?.role === 'admin') {
      return dueDateObj < today ? 'Overdue' : 'Unpaid';
    }
    
    if (studentHasPaid) return 'Paid';
    if (dueDateObj < today) return 'Overdue';
    return 'Unpaid';
  }, [studentHasPaid, due.dueDate, user?.role]);

  const { icon: StatusIcon, iconColorClass } = statusStyles[currentStatus];
  const formattedAmount = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(due.amount);
  
  const handlePayNow = async () => {
    if (!user || !user.studentId) {
      toast({ title: "Login Required", description: "Please log in to make a payment.", variant: "destructive" });
      return;
    }
    recordStudentPayment(due.id, user.id);
    
    setReceiptStudentName(user.name); 
    setReceiptStudentId(user.studentId);
    setReceiptDueDetails(due); 
    setIsReceiptModalOpen(true);

    toast({
      title: "Payment Successful!",
      description: `Payment for "${due.description}" has been processed by ${user.name}.`,
    });
  };

  const handleRemoveDue = () => {
    removeDue(due.id);
  };

  const handleViewPayments = () => {
    setSelectedDueForPaymentList(due);
    setIsPaymentListModalOpen(true);
  };

  return (
    <>
      <Card className="flex flex-col h-full shadow-lg hover:shadow-primary/20 transition-shadow duration-300 bg-gradient-to-br from-primary/80 to-secondary/80 text-primary-foreground overflow-hidden rounded-xl border-none">
        
        <CardHeader className="pt-4 pb-2 flex-row justify-between items-start">
          <div className="flex flex-col">
            <AppLogo />
            <p className="text-xs text-primary-foreground/80 -mt-1 ml-10">University Payments</p>
          </div>
          <StatusIcon className={cn("h-6 w-6", iconColorClass)} />
        </CardHeader>
        
        <CardContent className="flex-grow space-y-4 py-2 px-6 flex flex-col justify-between">
          <div>
            <Cpu className="w-12 h-12 text-yellow-300/80 my-2" />
            <div className="font-mono text-xl tracking-widest text-primary-foreground/90">
              **** **** **** {due.id.padStart(4, '0')}
            </div>
            <p className="font-semibold text-lg mt-2">{due.description}</p>
          </div>
          <div className="flex justify-between items-end">
             <div>
                <p className="text-xs text-primary-foreground/80 uppercase">Due Date</p>
                <p className="font-semibold">{createUTCDate(due.dueDate).toLocaleDateString('en-US', { timeZone: 'UTC', month: '2-digit', day: '2-digit', year: '2-digit' })}</p>
             </div>
             <div className="text-right">
                <p className="text-xs text-primary-foreground/80 uppercase">Amount</p>
                <p className="text-2xl font-bold font-mono">{formattedAmount}</p>
             </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 pb-4 px-4 bg-black/20 mt-auto flex flex-wrap gap-2 justify-between">
          {user?.role === 'student' && currentStatus !== 'Paid' && (
            <Button onClick={handlePayNow} size="sm" className="flex-1 basis-full sm:basis-auto bg-primary-foreground hover:bg-primary-foreground/90 text-primary min-w-[100px] font-bold">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </Button>
          )}
          {user?.role === 'student' && currentStatus === 'Paid' && user && user.studentId && (
             <Button 
                onClick={() => {
                    setReceiptStudentName(user.name);
                    setReceiptStudentId(user.studentId!);
                    setReceiptDueDetails(due);
                    setIsReceiptModalOpen(true);
                }} 
                size="sm" 
                variant="outline" 
                className="flex-1 basis-full sm:basis-auto text-primary-foreground border-primary-foreground/50 hover:bg-transparent hover:border-primary-foreground min-w-[150px]"
            >
              View My Receipt
            </Button>
          )}
          
          {user?.role === 'admin' && (
            <div className="w-full flex flex-col sm:flex-row sm:flex-wrap gap-2">
              <Button onClick={handleViewPayments} variant="outline" size="sm" className="flex-1 min-w-[140px] text-primary-foreground border-primary-foreground/50 hover:bg-transparent hover:border-primary-foreground">
                <Eye className="mr-2 h-4 w-4" /> View Payments
              </Button>
              <Button 
                onClick={handleRemoveDue} 
                variant="destructive" 
                size="sm" 
                className="flex-1 min-w-[110px] bg-red-500/80 hover:bg-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {receiptDueDetails && receiptStudentName && receiptStudentId && (
        <ReceiptModal 
          isOpen={isReceiptModalOpen} 
          onClose={() => {
            setIsReceiptModalOpen(false);
          }} 
          due={receiptDueDetails} 
          studentName={receiptStudentName}
          studentId={receiptStudentId}
          paymentDate={paymentDateForStudent || format(new Date(), 'yyyy-MM-dd')}
        />
      )}

      {user?.role === 'admin' && selectedDueForPaymentList && (
         <PaymentListModal
            isOpen={isPaymentListModalOpen}
            onClose={() => {
              setIsPaymentListModalOpen(false);
              setSelectedDueForPaymentList(null);
            }}
            dueDefinition={selectedDueForPaymentList}
         />
      )}
    </>
  );
}
