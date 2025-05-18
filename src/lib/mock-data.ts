
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

const today = new Date();
const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const mockDuesInitial: Due[] = [
  {
    id: '1',
    school: 'School of Engineering',
    department: 'Computer Science',
    description: 'Fall Semester Tuition Fee',
    amount: 1200.50,
    dueDate: formatDate(addDays(today, -15)), // Due date is in the past
    paymentMethodSuggestion: 'Online Portal',
  },
  {
    id: '2',
    school: 'School of Engineering',
    department: 'Mechanical Engineering',
    description: 'Lab Equipment Fee',
    amount: 75.00,
    dueDate: formatDate(addDays(today, 10)), // Due date is in the future
    paymentMethodSuggestion: 'Department Office (Cash/Card)',
  },
  {
    id: '3',
    school: 'School of Arts',
    department: 'Fine Arts',
    description: 'Studio Access Fee',
    amount: 50.25,
    dueDate: formatDate(addDays(today, -5)), // Due date in the past
  },
  {
    id: '4',
    school: 'School of Humanities',
    department: 'History',
    description: 'Library Late Fine',
    amount: 15.00,
    dueDate: formatDate(addDays(today, -35)), // Due date well in the past
    paymentMethodSuggestion: 'Library Front Desk',
  },
  {
    id: '5',
    school: 'School of Design',
    department: 'Industrial Design',
    description: 'Material Costs',
    amount: 250.75,
    dueDate: formatDate(addDays(today, 30)), // Due date in the future
    paymentMethodSuggestion: 'Online Payment Gateway',
  },
  {
    id: '6',
    school: 'School of Business',
    department: 'Management',
    description: 'Spring Semester Advance',
    amount: 1000.00,
    dueDate: formatDate(addDays(today, 60)), // Due date in the future
  },
   {
    id: '7',
    school: 'School of Engineering',
    department: 'Computer Science', // Same dept as due '1'
    description: 'Advanced Algorithms Textbook',
    amount: 90.00,
    dueDate: formatDate(addDays(today, 5)),
    paymentMethodSuggestion: 'University Bookstore',
  },
  {
    id: '8',
    school: 'School of Arts',
    department: 'Literature',
    description: 'Rare Books Access Fee',
    amount: 35.50,
    dueDate: formatDate(addDays(today, -2)), // Due date in the past
    paymentMethodSuggestion: 'Special Collections Desk',
  },
];

// These are now based on the Due definitions
export const uniqueSchools = Array.from(new Set(mockDuesInitial.map(due => due.school))).sort();
export const uniqueDepartments = Array.from(new Set(mockDuesInitial.map(due => due.department))).sort();
export const dueStatuses: DueStatus[] = ['Paid', 'Unpaid', 'Overdue']; // Statuses are now dynamic per student

