
"use client";

import type { Due, DueStatus } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, DollarSign, Info, Mail, School, Building, CalendarDays, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useDues } from '@/contexts/dues-context';
import { useState } from 'react';
import { ReceiptModal } from './receipt-modal'; // Import ReceiptModal
import { toast } from '@/hooks/use-toast';

interface DueCardProps {
  due: Due;
}

const statusStyles: Record<DueStatus, { icon: React.ElementType; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined, textColor: string, iconColor: string }> = {
  Paid: { icon: CheckCircle2, badgeVariant: 'default', textColor: 'text-accent-foreground', iconColor: 'text-accent' },
  Unpaid: { icon: Info, badgeVariant: 'secondary', textColor: 'text-secondary-foreground', iconColor: 'text-secondary' },
  Overdue: { icon: AlertTriangle, badgeVariant: 'destructive', textColor: 'text-destructive-foreground', iconColor: 'text-destructive' },
};

export function DueCard({ due }: DueCardProps) {
  const { user } = useAuth();
  const { updateDueStatus, getDueById } = useDues();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [paidDue, setPaidDue] = useState<Due | null>(null);

  const { icon: StatusIcon, badgeVariant, textColor, iconColor } = statusStyles[due.status];
  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(due.amount);
  
  const reminderLink = `/reminders?studentName=${encodeURIComponent(due.studentName)}&dueAmount=${due.amount}&dueDate=${due.dueDate}&schoolName=${encodeURIComponent(due.school)}&departmentName=${encodeURIComponent(due.department)}&paymentMethod=${encodeURIComponent(due.paymentMethodSuggestion || 'University Payment Portal')}`;

  const handlePayNow = async () => {
    // Simulate payment
    await new Promise(resolve => setTimeout(resolve, 500)); // Mock API call
    updateDueStatus(due.id, 'Paid', new Date());
    const updatedDue = getDueById(due.id); // Fetch the updated due to get paymentDate
    if (updatedDue) {
      setPaidDue(updatedDue);
    }
    setIsReceiptModalOpen(true);
    toast({
      title: "Payment Successful!",
      description: `Payment for "${due.description}" has been processed.`,
    });
  };

  return (
    <>
      <Card className="flex flex-col h-full shadow-lg hover:shadow-primary/20 transition-shadow duration-300 bg-card text-card-foreground overflow-hidden">
        <div className="relative w-full h-40">
          <Image 
            src={`https://placehold.co/600x240.png`}
            alt={`${due.school} ${due.department}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint="university building"
          />
          <div className={cn("absolute top-2 right-2")}>
            <Badge variant={badgeVariant || 'default'} className={cn(textColor, "flex items-center gap-1")}>
              <StatusIcon className={cn("h-4 w-4", iconColor)} />
              {due.status}
            </Badge>
          </div>
        </div>
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="text-lg leading-tight">{due.description}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
            <School className="h-4 w-4" /> {due.school}
          </CardDescription>
          <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
            <Building className="h-4 w-4" /> {due.department}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 py-2">
          <div className="flex items-center text-lg font-semibold text-primary">
            <DollarSign className="mr-1 h-5 w-5" />
            {formattedAmount}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="mr-1 h-4 w-4" />
            Due: {new Date(due.dueDate).toLocaleDateString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Student: {due.studentName}
          </div>
          {due.status === 'Paid' && due.paymentDate && (
            <div className="flex items-center text-sm text-accent">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Paid on: {new Date(due.paymentDate).toLocaleDateString()}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2 pb-4 space-x-2">
          {user?.role === 'student' && (due.status === 'Unpaid' || due.status === 'Overdue') && (
            <Button onClick={handlePayNow} size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </Button>
          )}
          {(user?.role === 'admin') && (due.status === 'Unpaid' || due.status === 'Overdue') && (
            <Button asChild variant="outline" size="sm" className="w-full hover:bg-accent hover:text-accent-foreground">
              <Link href={reminderLink}>
                <Mail className="mr-2 h-4 w-4" />
                Generate Reminder
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
      {paidDue && (
        <ReceiptModal 
          isOpen={isReceiptModalOpen} 
          onClose={() => {
            setIsReceiptModalOpen(false);
            setPaidDue(null);
          }} 
          due={paidDue} 
        />
      )}
    </>
  );
}
