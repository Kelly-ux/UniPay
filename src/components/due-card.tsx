
"use client";

import type { Due, DueStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Info, School, Building, CalendarDays, CreditCard, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useDues } from '@/contexts/dues-context';
import React, { useState, useMemo } from 'react';
import { ReceiptModal } from './receipt-modal';
import { PaymentListModal } from './payment-list-modal';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns'; 
import { useRouter } from 'next/navigation';

interface DueCardProps {
  due: Due;
}

const statusStyles: Record<string, { icon: React.ElementType; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined, textColorClass: string, iconColorClass: string, badgeBgClass: string }> = {
  Paid: { icon: CheckCircle2, badgeVariant: 'default', textColorClass: 'text-green-700', iconColorClass: 'text-green-600', badgeBgClass: 'bg-green-100 border-green-300' },
  Unpaid: { icon: Info, badgeVariant: 'secondary', textColorClass: 'text-blue-700', iconColorClass: 'text-blue-600', badgeBgClass: 'bg-blue-100 border-blue-300' },
  Upcoming: { icon: Info, badgeVariant: 'secondary', textColorClass: 'text-blue-700', iconColorClass: 'text-blue-600', badgeBgClass: 'bg-blue-100 border-blue-300' },
  Overdue: { icon: AlertTriangle, badgeVariant: 'destructive', textColorClass: 'text-red-700', iconColorClass: 'text-red-600', badgeBgClass: 'bg-red-100 border-red-300' },
};

export function DueCard({ due }: DueCardProps) {
  const { user } = useAuth();
  const { recordStudentPayment, hasStudentPaid, getStudentPaymentDate, removeDue, studentPayments } = useDues();
  const router = useRouter();
  
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

  const displayStatus = useMemo(() => currentStatus, [currentStatus]);
  const { icon: StatusIcon, badgeVariant, textColorClass, iconColorClass, badgeBgClass } = statusStyles[displayStatus];
  const formattedAmount = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(due.amount);
  
  const handlePayNow = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to make a payment.", variant: "destructive" });
      return;
    }
    if (!user.studentId) {
      toast({ title: "Student ID Required", description: "Add your Student ID in your profile before paying.", variant: "destructive" });
      router.push('/profile');
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
      <Card className="flex flex-col h-full shadow-lg hover:shadow-primary/10 transition-shadow duration-300 bg-card text-card-foreground overflow-hidden border border-border rounded-xl">
        <div className="relative w-full h-40">
          <Image 
            src={due.imageUrl || "https://images.unsplash.com/photo-1613243555988-441166d4d6fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxjcmVkaXQlMjBjYXJkfGVufDB8fHx8MTc1NDU2Nzk2M3ww&ixlib=rb-4.1.0&q=80&w=1080"}
            alt={due.imageAlt || `${due.school} ${due.department}`}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint="university campus"
          />
          {user?.role !== 'admin' && (
            <div className={cn("absolute top-2 right-2")}> 
              <div className="flex flex-col items-end gap-1">
                <Badge variant={badgeVariant || 'default'} className={cn(textColorClass, badgeBgClass, "flex items-center gap-1 font-semibold")}> 
                  <StatusIcon className={cn("h-4 w-4", iconColorClass)} /> 
                  {displayStatus}
                </Badge>
              </div>
            </div>
          )}
        </div>
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="text-lg leading-tight font-semibold">{due.description}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground flex items-center gap-1 pt-1">
            <School className="h-4 w-4 text-muted-foreground" /> {due.school}
          </CardDescription>
          <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
            <Building className="h-4 w-4 text-muted-foreground" /> {due.department}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 py-2">
          <div className="flex items-center text-xl font-bold text-primary font-mono">
            {formattedAmount}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="mr-1 h-4 w-4" />
            Due: {createUTCDate(due.dueDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}
          </div>
          {user?.role === 'admin' && (
            <AdminDueMetrics dueId={due.id} allPayments={studentPayments} />
          )}
          {user?.role === 'student' && currentStatus === 'Paid' && paymentDateForStudent && (
            <div className="flex items-center text-sm text-green-600 font-medium">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              You paid on: {createUTCDate(paymentDateForStudent).toLocaleDateString('en-US', { timeZone: 'UTC' })}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-3 pb-4 border-t mt-auto flex flex-wrap gap-2 justify-between">
          {user?.role === 'student' && currentStatus !== 'Paid' && (
            <Button onClick={handlePayNow} size="sm" className="flex-1 basis-full sm:basis-auto bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]">
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
                className="flex-1 basis-full sm:basis-auto text-green-600 border-green-500 hover:bg-green-50 hover:text-green-700 min-w-[150px]"
            >
              View My Receipt
            </Button>
          )}
          
          {user?.role === 'admin' && (
            <div className="w-full flex flex-col sm:flex-row sm:flex-wrap gap-2">
              <Button onClick={handleViewPayments} variant="outline" size="sm" className="flex-1 min-w-[140px] hover:bg-blue-50 hover:text-blue-700 border-blue-500 text-blue-600">
                <Eye className="mr-2 h-4 w-4" /> View Payments
              </Button>
              <Button 
                onClick={handleRemoveDue} 
                variant="destructive" 
                size="sm" 
                className="flex-1 min-w-[110px]"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Archive
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

function AdminDueMetrics({ dueId, allPayments }: { dueId: string; allPayments: { dueId: string; studentId: string; paymentDate: string; }[] }) {
  const paymentsForDue = React.useMemo(() => allPayments.filter(p => p.dueId === dueId), [allPayments, dueId]);
  const count = paymentsForDue.length;
  const lastPaymentDate = React.useMemo(() => {
    if (paymentsForDue.length === 0) return null;
    const max = paymentsForDue.reduce((acc, p) => (p.paymentDate > acc ? p.paymentDate : acc), paymentsForDue[0].paymentDate);
    return max;
  }, [paymentsForDue]);
  return (
    <div className="mt-2 text-sm text-muted-foreground space-y-1">
      <div><span className="font-medium text-foreground">{count}</span> paid</div>
      {lastPaymentDate && (
        <div>Last payment: {new Date(lastPaymentDate + 'T00:00:00.000Z').toLocaleDateString()}</div>
      )}
    </div>
  );
}
