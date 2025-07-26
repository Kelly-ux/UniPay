
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Due } from '@/lib/types';
import { mockDuesInitial } from '@/lib/mock-data';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export interface StudentPayment {
  studentId: string; // User ID
  dueId: string;     // Due definition ID
  paymentDate: string; // YYYY-MM-DD
}

interface DuesContextType {
  dues: Due[]; // Due definitions
  studentPayments: StudentPayment[];
  addDue: (newDueData: Omit<Due, 'id'>) => void; // Admin adds a due definition
  removeDue: (dueId: string) => void; // Admin removes a due definition
  recordStudentPayment: (dueId: string, studentId: string) => void;
  hasStudentPaid: (dueId: string, studentId: string) => boolean;
  getStudentPaymentDate: (dueId: string, studentId: string) => string | undefined;
  getDueById: (dueId: string) => Due | undefined;
}

const DuesContext = createContext<DuesContextType | undefined>(undefined);

const DUES_DEFINITIONS_STORAGE_KEY = 'duesPayDuesDefinitions';
const STUDENT_PAYMENTS_STORAGE_KEY = 'duesPayStudentPayments';


export const DuesProvider = ({ children }: { children: ReactNode }) => {
  const [dues, setDues] = useState<Due[]>(() => {
    if (typeof window !== 'undefined') {
      const savedDues = localStorage.getItem(DUES_DEFINITIONS_STORAGE_KEY);
      try {
        return savedDues ? JSON.parse(savedDues) : mockDuesInitial;
      } catch (e) {
        console.error("Failed to parse dues from localStorage", e);
        localStorage.removeItem(DUES_DEFINITIONS_STORAGE_KEY); // Clear corrupted data
        return mockDuesInitial;
      }
    }
    return mockDuesInitial;
  });

  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>(() => {
     if (typeof window !== 'undefined') {
      const savedPayments = localStorage.getItem(STUDENT_PAYMENTS_STORAGE_KEY);
      try {
        return savedPayments ? JSON.parse(savedPayments) : [];
      } catch (e) {
        console.error("Failed to parse student payments from localStorage", e);
        localStorage.removeItem(STUDENT_PAYMENTS_STORAGE_KEY); // Clear corrupted data
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DUES_DEFINITIONS_STORAGE_KEY, JSON.stringify(dues));
    }
  }, [dues]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STUDENT_PAYMENTS_STORAGE_KEY, JSON.stringify(studentPayments));
    }
  }, [studentPayments]);


  const addDue = useCallback((newDueData: Omit<Due, 'id'>) => {
    setDues((prevDues) => {
      const newId = (Math.max(0, ...prevDues.map(d => parseInt(d.id, 10) || 0)) + 1).toString();
      const dueDefinition: Due = {
        ...newDueData,
        id: newId,
      };
      return [...prevDues, dueDefinition];
    });
  }, []);

  const removeDue = useCallback((dueIdToRemove: string) => {
    const dueToRemove = dues.find(d => d.id === dueIdToRemove);
    setDues((prevDues) => prevDues.filter(due => due.id !== dueIdToRemove));
    // Also remove any student payments associated with this due
    setStudentPayments((prevPayments) => prevPayments.filter(payment => payment.dueId !== dueIdToRemove));
    if (dueToRemove) {
        toast({
            title: "Due Removed",
            description: `The due "${dueToRemove.description}" has been successfully removed.`,
        });
    }
  }, [dues]);

  const recordStudentPayment = useCallback((dueId: string, studentId: string) => {
    setStudentPayments((prevPayments) => {
      if (prevPayments.some(p => p.dueId === dueId && p.studentId === studentId)) {
        return prevPayments;
      }
      const newPayment: StudentPayment = {
        dueId,
        studentId,
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
      };
      return [...prevPayments, newPayment];
    });
  }, []);

  const hasStudentPaid = useCallback((dueId: string, studentId: string): boolean => {
    return studentPayments.some(p => p.dueId === dueId && p.studentId === studentId);
  }, [studentPayments]);

  const getStudentPaymentDate = useCallback((dueId: string, studentId: string): string | undefined => {
    const payment = studentPayments.find(p => p.dueId === dueId && p.studentId === studentId);
    return payment?.paymentDate;
  }, [studentPayments]);


  const getDueById = useCallback((dueId: string) => {
    return dues.find(due => due.id === dueId);
  }, [dues]);

  return (
    <DuesContext.Provider value={{ dues, studentPayments, addDue, removeDue, recordStudentPayment, hasStudentPaid, getStudentPaymentDate, getDueById }}>
      {children}
    </DuesContext.Provider>
  );
};

export const useDues = () => {
  const context = useContext(DuesContext);
  if (context === undefined) {
    throw new Error('useDues must be used within a DuesProvider');
  }
  return context;
};
