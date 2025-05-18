"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReminderFormSchema, type ReminderFormValues } from '@/lib/schemas';
import { generatePaymentReminder, type GeneratePaymentReminderInput } from '@/ai/flows/generate-payment-reminder';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, Send, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ReminderFormProps {
  initialData?: Partial<ReminderFormValues & { dueDate?: string }>; // Allow string for initial dueDate from query
}

export function ReminderForm({ initialData }: ReminderFormProps) {
  const [generatedReminder, setGeneratedReminder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(ReminderFormSchema),
    defaultValues: {
      studentName: initialData?.studentName || '',
      dueAmount: initialData?.dueAmount || 0,
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : new Date(),
      schoolName: initialData?.schoolName || '',
      departmentName: initialData?.departmentName || '',
      paymentMethod: initialData?.paymentMethod || '',
    },
  });

  useEffect(() => {
    if (initialData) {
        form.reset({
            studentName: initialData.studentName || '',
            dueAmount: initialData.dueAmount || 0,
            dueDate: initialData.dueDate ? new Date(initialData.dueDate) : new Date(), // Ensure Date object
            schoolName: initialData.schoolName || '',
            departmentName: initialData.departmentName || '',
            paymentMethod: initialData.paymentMethod || '',
        });
    }
  }, [initialData, form]);


  const onSubmit = async (values: ReminderFormValues) => {
    setIsLoading(true);
    setGeneratedReminder(null);
    setError(null);

    const inputForAI: GeneratePaymentReminderInput = {
      ...values,
      userName: values.studentName, // Map studentName to userName as per AI schema
      dueDate: format(values.dueDate, 'yyyy-MM-dd'), // Format date for AI
    };

    try {
      const result = await generatePaymentReminder(inputForAI);
      setGeneratedReminder(result.reminderText);
      toast({
        title: "Reminder Generated",
        description: "The payment reminder has been successfully generated.",
      });
    } catch (e) {
      console.error("Error generating reminder:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to generate reminder: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Failed to generate reminder: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create Payment Reminder</CardTitle>
          <CardDescription>Fill in the details to generate a personalized payment reminder using AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 150.75" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., School of Engineering" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departmentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggested Payment Method</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Online Portal, Department Office" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="mr-2 h-4 w-4" /> Generate Reminder
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-center space-x-2 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive text-lg">Generation Failed</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {generatedReminder && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Generated Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedReminder}
              readOnly
              rows={8}
              className="w-full text-base bg-muted/50 border-border"
            />
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(generatedReminder).then(() => toast({ title: "Copied!", description: "Reminder text copied to clipboard."}))}>
              Copy to Clipboard
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
