
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth-guard';
import { useDues } from '@/contexts/dues-context';
import { uniqueSchools, uniqueDepartments } from '@/lib/mock-data'; 
import { toast } from '@/hooks/use-toast';
import { CalendarIcon, DollarSign, FilePlus, User, Building, SchoolIcon as SchoolLucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

const AddDueSchema = z.object({
  studentName: z.string().min(1, 'Student name is required.'),
  description: z.string().min(3, 'Description must be at least 3 characters.'),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
  dueDate: z.date({ required_error: 'Due date is required.' }),
  school: z.string().min(1, 'School is required.'),
  department: z.string().min(1, 'Department is required.'),
  paymentMethodSuggestion: z.string().optional(),
});

type AddDueFormValues = z.infer<typeof AddDueSchema>;

function AddDueForm() {
  const { addDue } = useDues();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddDueFormValues>({
    resolver: zodResolver(AddDueSchema),
    defaultValues: {
      studentName: '',
      description: '',
      amount: 0,
      // dueDate: new Date(), // Default to today
      school: '',
      department: '',
      paymentMethodSuggestion: 'Online Portal',
    },
  });

  const onSubmit = async (data: AddDueFormValues) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dueDataForContext = {
        ...data,
        dueDate: format(data.dueDate, 'yyyy-MM-dd'), 
      };
      addDue(dueDataForContext);

      toast({
        title: 'Due Added Successfully!',
        description: `Due for ${data.studentName} (${data.description}) has been created.`,
      });
      form.reset(); 
      router.push('/admin'); 
    } catch (error) {
      console.error('Failed to add due:', error);
      toast({
        title: 'Error Adding Due',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <FilePlus className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-bold">Add New Due</CardTitle>
        </div>
        <CardDescription>Fill out the form below to create a new payment due for a student.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Name */}
            <div className="space-y-2">
              <Label htmlFor="studentName" className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" />Student Name</Label>
              <Input id="studentName" placeholder="e.g., Jane Doe" {...form.register('studentName')} />
              {form.formState.errors.studentName && <p className="text-sm text-destructive">{form.formState.errors.studentName.message}</p>}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />Amount (USD)</Label>
              <Input id="amount" type="number" step="0.01" placeholder="e.g., 150.50" {...form.register('amount')} />
              {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="e.g., Spring Semester Lab Fee" {...form.register('description')} />
            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School */}
            <div className="space-y-2">
              <Label htmlFor="school" className="flex items-center"><SchoolLucideIcon className="mr-2 h-4 w-4 text-muted-foreground" />School</Label>
              <Controller
                name="school"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="school">
                      <SelectValue placeholder="Select School" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSchools.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.school && <p className="text-sm text-destructive">{form.formState.errors.school.message}</p>}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" />Department</Label>
               <Controller
                name="department"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueDepartments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.department && <p className="text-sm text-destructive">{form.formState.errors.department.message}</p>}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />Due Date</Label>
            <Controller
              name="dueDate"
              control={form.control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card"> {/* Ensure popover content also uses card bg for light theme */}
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
              )}
            />
            {form.formState.errors.dueDate && <p className="text-sm text-destructive">{form.formState.errors.dueDate.message}</p>}
          </div>
          
          {/* Payment Method Suggestion */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethodSuggestion">Payment Method Suggestion (Optional)</Label>
            <Input id="paymentMethodSuggestion" placeholder="e.g., Online Portal, Department Office" {...form.register('paymentMethodSuggestion')} />
            {form.formState.errors.paymentMethodSuggestion && <p className="text-sm text-destructive">{form.formState.errors.paymentMethodSuggestion.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Due...
              </>
            ) : (
              'Add Due'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AddDuePage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="py-8">
        <AddDueForm />
      </div>
    </AuthGuard>
  );
}
