
import { z } from 'zod';

// Making studentName optional for the ReminderForm itself,
// as the AI flow now supports generating general reminders.
export const ReminderFormSchema = z.object({
  studentName: z.string().optional(), // Now optional
  dueAmount: z.coerce.number().positive({ message: "Due amount must be a positive number." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  schoolName: z.string().min(1, { message: "School name is required." }),
  departmentName: z.string().min(1, { message: "Department name is required." }),
  paymentMethod: z.string().min(1, { message: "Payment method is required." }),
  description: z.string().optional(), // Description of the due item
});

export type ReminderFormValues = z.infer<typeof ReminderFormSchema>;
