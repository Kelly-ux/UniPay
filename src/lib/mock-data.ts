
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

// Authoritative list of schools and their departments
export const schoolAndDepartmentData = [
  {
    name: 'School of Engineering',
    departments: [
      'Department of Mechanical & manufacturing engineering',
      'Department of Computer & electrical engineering',
      'Department of civil & environmental engineering',
      'Department of agricultural and bio-resources engineering',
    ],
  },
  {
    name: 'School of Energy',
    departments: [
      'Department of renewable energy engineering',
      'Department of petroleum and natural gas engineering',
    ],
  },
  {
    name: 'School of Natural resources',
    departments: [
      'Department of forest science',
      'Department of fisheries and water resources',
      'Department of environmental management',
      'Department of ecotourism, recreation & hospitality',
      'Department of fire, safety and disaster management',
    ],
  },
  {
    name: 'School of Science',
    departments: [
      'Department of chemical sciences',
      'Department of computer science and informatics',
      'Department of mathematics and statistics',
      'Department of nursing',
      'Department of biological science',
      'Department of medical laboratory science',
      'Department of information technology & decision science',
    ],
  },
  {
    name: 'School of Agriculture & technology',
    departments: [
      'Department of agribusiness management and consumer studies',
      'Department of horticulture and crop production',
      'Department of animal production and health',
      'Department of agriculture and resources economics',
      'Department of food science and technology',
    ],
  },
];


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
    department: 'Department of Computer & electrical engineering',
    description: 'Fall Semester Lab Fee',
    amount: 1200.50,
    dueDate: formatDate(addDays(today, -15)), // Due date is in the past
    paymentMethodSuggestion: 'Online Portal',
  },
  {
    id: '2',
    school: 'School of Engineering',
    department: 'Department of Mechanical & manufacturing engineering',
    description: 'Workshop Safety Certification',
    amount: 75.00,
    dueDate: formatDate(addDays(today, 10)), // Due date is in the future
    paymentMethodSuggestion: 'Department Office (Cash/Card)',
  },
  {
    id: '3',
    school: 'School of Natural resources',
    department: 'Department of ecotourism, recreation & hospitality',
    description: 'Annual Field Trip Contribution',
    amount: 150.25,
    dueDate: formatDate(addDays(today, -5)), // Due date in the past
  },
  {
    id: '4',
    school: 'School of Science',
    department: 'Department of computer science and informatics',
    description: 'Advanced Programming Textbook',
    amount: 95.00,
    dueDate: formatDate(addDays(today, 20)),
    paymentMethodSuggestion: 'University Bookstore',
  },
  {
    id: '5',
    school: 'School of Agriculture & technology',
    department: 'Department of food science and technology',
    description: 'Food Grading Practical Fee',
    amount: 250.75,
    dueDate: formatDate(addDays(today, 30)), // Due date in the future
    paymentMethodSuggestion: 'Online Payment Gateway',
  },
  {
    id: '6',
    school: 'School of Energy',
    department: 'Department of renewable energy engineering',
    description: 'Language Lab Access Fee',
    amount: 50.00,
    dueDate: formatDate(addDays(today, 60)), // Due date in the future
  },
];

// These are now based on the Due definitions
export const uniqueSchools = Array.from(new Set(mockDuesInitial.map(due => due.school))).sort();
export const uniqueDepartments = Array.from(new Set(mockDuesInitial.map(due => due.department))).sort();
export const dueStatuses: DueStatus[] = ['Paid', 'Unpaid', 'Overdue']; // Statuses are now dynamic per student

// Map for known student names, used for mock login and display
export const studentNameMap: Record<string, string> = {
  "alice": "Alice Wonderland",
  "bob": "Bob The Builder",
  "charlie": "Charlie Brown",
  "diana": "Diana Prince",
  "edward": "Edward Scissorhands",
  "fiona": "Fiona Gallagher",
  "harry": "Harry Potter",
  "hermione": "Hermione Granger",
  // Add more mock students as needed
};

// Helper to get student display name from a potentially prefixed ID
export const getStudentDisplayNameFromId = (studentId: string): string => {
  if (studentId.startsWith('mock-student-')) {
    const emailPrefix = studentId.replace('mock-student-', '');
    return studentNameMap[emailPrefix] || studentId; // Fallback to ID if prefix not in map
  }
  // For admin users or other ID formats, you might have a different lookup or just return the ID
  if (studentId === 'admin-user') return 'Admin User'; // Example for admin
  return studentId; // Fallback for any other ID format
};
