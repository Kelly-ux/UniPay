
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
  imageUrl?: string;
  imageAlt?: string;
}

// Represents a single payment entry for a student and due
export interface StudentPayment {
  studentId: string; // User ID
  dueId: string;     // Due definition ID
  paymentDate: string; // YYYY-MM-DD
}

// Represents a single payment entry for a student and due
export interface StudentPayment {
  studentId: string; // User ID
  dueId: string;     // Due definition ID
  paymentDate: string; // YYYY-MM-DD
}
