
"use client";

import type { Due, DueStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Info, Mail, School, Building, CalendarDays, CreditCard, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useDues } from '@/contexts/dues-context';
import React, { useState, useMemo } from 'react';
import { ReceiptModal } from './receipt-modal';
import { PaymentListModal } from './payment-list-modal'; // Import the new modal
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns'; 

interface DueCardProps {
  due: Due; // This is a Due Definition
}

const statusStyles: Record<DueStatus, { icon: React.ElementType; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined, textColorClass: string, iconColorClass: string, badgeBgClass: string }> = {
  Paid: { icon: CheckCircle2, badgeVariant: 'default', textColorClass: 'text-green-700', iconColorClass: 'text-green-600', badgeBgClass: 'bg-green-100 border-green-300' },
  Unpaid: { icon: Info, badgeVariant: 'secondary', textColorClass: 'text-blue-700', iconColorClass: 'text-blue-600', badgeBgClass: 'bg-blue-100 border-blue-300' },
  Overdue: { icon: AlertTriangle, badgeVariant: 'destructive', textColorClass: 'text-red-700', iconColorClass: 'text-red-600', badgeBgClass: 'bg-red-100 border-red-300' },
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

  // Helper function to create a UTC date from a 'YYYY-MM-DD' string
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

  const { icon: StatusIcon, badgeVariant, textColorClass, iconColorClass, badgeBgClass } = statusStyles[currentStatus];
  const formattedAmount = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(due.amount);
  
  const reminderLink = `/admin/generate-reminder?dueAmount=${due.amount}&dueDate=${due.dueDate}&schoolName=${encodeURIComponent(due.school)}&departmentName=${encodeURIComponent(due.department)}&paymentMethod=${encodeURIComponent(due.paymentMethodSuggestion || 'University Payment Portal')}&description=${encodeURIComponent(due.description)}`;


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
      <Card className="flex flex-col h-full shadow-lg hover:shadow-primary/10 transition-shadow duration-300 bg-card text-card-foreground overflow-hidden border border-border rounded-xl">
        <div className="relative w-full h-40">
          <Image 
            src={`https://placehold.co/600x240/64B5F6/FFFFFF?text=`}
            alt={`${due.school} ${due.department}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint="university campus"
          />
          <div className={cn("absolute top-2 right-2")}>
            <Badge variant={badgeVariant || 'default'} className={cn(textColorClass, badgeBgClass, "flex items-center gap-1 font-semibold")}>
              <StatusIcon className={cn("h-4 w-4", iconColorClass)} />
              {currentStatus}
            </Badge>
          </div>
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
              <Button asChild variant="outline" size="sm" className="flex-1 min-w-[140px] hover:bg-accent hover:text-accent-foreground border-primary/50 text-primary hover:border-primary">
                <Link href={reminderLink}>
                  <Mail className="mr-2 h-4 w-4" />
                  Gen. Reminder
                </Link>
              </Button>
              <Button 
                onClick={handleRemoveDue} 
                variant="destructive" 
                size="sm" 
                className="flex-1 min-w-[110px]"
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
