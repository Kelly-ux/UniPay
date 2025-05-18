import { z } from 'zod';

export const ReminderFormSchema = z.object({
  studentName: z.string().min(1, { message: "Student name is required." }),
  dueAmount: z.coerce.number().positive({ message: "Due amount must be a positive number." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  schoolName: z.string().min(1, { message: "School name is required." }),
  departmentName: z.string().min(1, { message: "Department name is required." }),
  paymentMethod: z.string().min(1, { message: "Payment method is required." }),
});

export type ReminderFormValues = z.infer<typeof ReminderFormSchema>;
