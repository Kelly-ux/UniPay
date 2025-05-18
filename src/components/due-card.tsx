
"use client";

import type { Due, DueStatus } from '@/lib/mock-data'; // Due is now a DueDefinition
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, DollarSign, Info, Mail, School, Building, CalendarDays, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useDues } from '@/contexts/dues-context';
import React, { useState, useMemo } from 'react';
import { ReceiptModal } from './receipt-modal';
import { toast } from '@/hooks/use-toast';

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
  const { recordStudentPayment, hasStudentPaid, getStudentPaymentDate, getDueById } = useDues();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  
  // State to hold the studentName for the receipt, captured at payment time
  const [receiptStudentName, setReceiptStudentName] = useState<string | null>(null);
  const [receiptDueDetails, setReceiptDueDetails] = useState<Due | null>(null);


  const studentHasPaid = useMemo(() => {
    if (!user) return false;
    return hasStudentPaid(due.id, user.id);
  }, [due.id, user, hasStudentPaid]);

  const paymentDateForStudent = useMemo(() => {
    if (!user || !studentHasPaid) return undefined;
    return getStudentPaymentDate(due.id, user.id);
  }, [due.id, user, studentHasPaid, getStudentPaymentDate]);

  const currentStatus: DueStatus = useMemo(() => {
    if (studentHasPaid) return 'Paid';
    if (new Date(due.dueDate) < new Date() && !due.dueDate.endsWith('T00:00:00.000Z')) return 'Overdue'; // Ensure correct date comparison
    return 'Unpaid';
  }, [studentHasPaid, due.dueDate]);

  const { icon: StatusIcon, badgeVariant, textColorClass, iconColorClass, badgeBgClass } = statusStyles[currentStatus];
  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(due.amount);
  
  // Reminder link needs studentName - this is problematic if due is departmental.
  // For admin "Generate Reminder" button, they might need to pick a student or it generates a generic reminder.
  // Let's make the reminder generic for now, or remove studentName from query param.
  // A department-wide reminder might be more appropriate.
  // For now, the existing reminder AI flow expects a student name. We can pass a placeholder or modify the flow.
  // Let's pass the Department and School instead of a specific student.
  const reminderLink = `/admin/generate-reminder?dueAmount=${due.amount}&dueDate=${due.dueDate}&schoolName=${encodeURIComponent(due.school)}&departmentName=${encodeURIComponent(due.department)}&paymentMethod=${encodeURIComponent(due.paymentMethodSuggestion || 'University Payment Portal')}&description=${encodeURIComponent(due.description)}`;


  const handlePayNow = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to make a payment.", variant: "destructive" });
      return;
    }
    // Simulate payment
    await new Promise(resolve => setTimeout(resolve, 500)); 
    recordStudentPayment(due.id, user.id);
    
    setReceiptStudentName(user.name); // Capture current user's name for the receipt
    setReceiptDueDetails(due); // Set the current due details for the receipt
    setIsReceiptModalOpen(true);

    toast({
      title: "Payment Successful!",
      description: `Payment for "${due.description}" has been processed by ${user.name}.`,
    });
  };

  return (
    <>
      <Card className="flex flex-col h-full shadow-lg hover:shadow-primary/10 transition-shadow duration-300 bg-card text-card-foreground overflow-hidden border border-border rounded-xl">
        <div className="relative w-full h-40">
          <Image 
            src={`https://placehold.co/600x240.png`}
            alt={`${due.school} ${due.department}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint="university campus building"
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
          <div className="flex items-center text-xl font-bold text-primary">
            <DollarSign className="mr-1 h-5 w-5" />
            {formattedAmount}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="mr-1 h-4 w-4" />
            Due: {new Date(due.dueDate).toLocaleDateString()}
          </div>
          {/* Removed studentName display from here as due is departmental */}
          {currentStatus === 'Paid' && paymentDateForStudent && (
            <div className="flex items-center text-sm text-green-600 font-medium">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              You paid on: {new Date(paymentDateForStudent).toLocaleDateString()}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-3 pb-4 space-x-2 border-t mt-auto">
          {user?.role === 'student' && currentStatus !== 'Paid' && (
            <Button onClick={handlePayNow} size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </Button>
          )}
          {user?.role === 'student' && currentStatus === 'Paid' && (
             <Button 
                onClick={() => {
                    setReceiptStudentName(user.name);
                    setReceiptDueDetails(due);
                    setIsReceiptModalOpen(true);
                }} 
                size="sm" 
                variant="outline" 
                className="w-full text-green-600 border-green-500 hover:bg-green-50 hover:text-green-700"
            >
              View My Receipt
            </Button>
          )}
          {(user?.role === 'admin') && (
            <Button asChild variant="outline" size="sm" className="w-full hover:bg-accent hover:text-accent-foreground border-primary/50 text-primary hover:border-primary">
              <Link href={reminderLink}>
                <Mail className="mr-2 h-4 w-4" />
                Generate Reminder
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
      {receiptDueDetails && receiptStudentName && (
        <ReceiptModal 
          isOpen={isReceiptModalOpen} 
          onClose={() => {
            setIsReceiptModalOpen(false);
            setReceiptStudentName(null);
            setReceiptDueDetails(null);
          }} 
          due={receiptDueDetails} 
          studentName={receiptStudentName}
          paymentDate={paymentDateForStudent || format(new Date(), 'yyyy-MM-dd')} // Fallback if somehow not set
        />
      )}
    </>
  );
}
