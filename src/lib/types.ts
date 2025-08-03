
export interface User {
  id: string; // This will now be the official Student ID for students
  email: string;
  name: string;
  role: 'student' | 'admin';
}

// Represents the status of a due for a specific student
export type DueStatus = 'Paid' | 'Unpaid' | 'Overdue';

// Represents a Due Definition at the school/department level
export interface Due {
  id: string;
  school: string;
  department: string;
  description: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paymentMethodSuggestion?: string;
}
