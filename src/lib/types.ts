
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  studentId?: string; // studentId is optional and belongs to the user
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
