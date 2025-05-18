export type DueStatus = 'Paid' | 'Unpaid' | 'Overdue';

export interface Due {
  id: string;
  studentName: string;
  school: string;
  department: string;
  description: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: DueStatus;
  paymentMethodSuggestion?: string; // For pre-filling reminder form
}

const today = new Date();
const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const mockDues: Due[] = [
  {
    id: '1',
    studentName: 'Alice Wonderland',
    school: 'School of Engineering',
    department: 'Computer Science',
    description: 'Fall Semester Tuition Fee',
    amount: 1200.50,
    dueDate: formatDate(addDays(today, -15)), // Overdue
    status: 'Overdue',
    paymentMethodSuggestion: 'Online Portal',
  },
  {
    id: '2',
    studentName: 'Bob The Builder',
    school: 'School of Engineering',
    department: 'Mechanical Engineering',
    description: 'Lab Equipment Fee',
    amount: 75.00,
    dueDate: formatDate(addDays(today, 10)), // Unpaid
    status: 'Unpaid',
    paymentMethodSuggestion: 'Department Office (Cash/Card)',
  },
  {
    id: '3',
    studentName: 'Charlie Brown',
    school: 'School of Arts',
    department: 'Fine Arts',
    description: 'Studio Access Fee',
    amount: 50.25,
    dueDate: formatDate(addDays(today, -5)), // Paid (recently)
    status: 'Paid',
  },
  {
    id: '4',
    studentName: 'Diana Prince',
    school: 'School of Humanities',
    department: 'History',
    description: 'Library Late Fine',
    amount: 15.00,
    dueDate: formatDate(addDays(today, -35)), // Overdue
    status: 'Overdue',
    paymentMethodSuggestion: 'Library Front Desk',
  },
  {
    id: '5',
    studentName: 'Edward Scissorhands',
    school: 'School of Design',
    department: 'Industrial Design',
    description: 'Material Costs',
    amount: 250.75,
    dueDate: formatDate(addDays(today, 30)), // Unpaid
    status: 'Unpaid',
    paymentMethodSuggestion: 'Online Payment Gateway',
  },
  {
    id: '6',
    studentName: 'Fiona Gallagher',
    school: 'School of Business',
    department: 'Management',
    description: 'Spring Semester Advance',
    amount: 1000.00,
    dueDate: formatDate(addDays(today, 60)), // Paid (well in advance)
    status: 'Paid',
  },
   {
    id: '7',
    studentName: 'Harry Potter',
    school: 'School of Engineering',
    department: 'Computer Science',
    description: 'Advanced Algorithms Textbook',
    amount: 90.00,
    dueDate: formatDate(addDays(today, 5)),
    status: 'Unpaid',
    paymentMethodSuggestion: 'University Bookstore',
  },
  {
    id: '8',
    studentName: 'Hermione Granger',
    school: 'School of Arts',
    department: 'Literature',
    description: 'Rare Books Access Fee',
    amount: 35.50,
    dueDate: formatDate(addDays(today, -2)),
    status: 'Overdue',
    paymentMethodSuggestion: 'Special Collections Desk',
  },
];

export const uniqueSchools = Array.from(new Set(mockDues.map(due => due.school))).sort();
export const uniqueDepartments = Array.from(new Set(mockDues.map(due => due.department))).sort();
export const dueStatuses: DueStatus[] = ['Paid', 'Unpaid', 'Overdue'];
