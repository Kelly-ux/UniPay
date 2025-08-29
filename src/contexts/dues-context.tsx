
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Due, StudentPayment } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { DuesApi, PaymentsApi } from '@/lib/api';
import { isApiConfigured } from '@/lib/env';

// StudentPayment moved to shared types

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
  const { user, token } = useAuth();
  const [dues, setDues] = useState<Due[]>(() => {
    if (typeof window !== 'undefined') {
      const savedDues = localStorage.getItem(DUES_DEFINITIONS_STORAGE_KEY);
      try {
        return savedDues ? JSON.parse(savedDues) : [];
      } catch (e) {
        console.error("Failed to parse dues from localStorage", e);
        localStorage.removeItem(DUES_DEFINITIONS_STORAGE_KEY);
        return [];
      }
    }
    return [];
  });

  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>(() => {
    if (typeof window !== 'undefined') {
      const savedPayments = localStorage.getItem(STUDENT_PAYMENTS_STORAGE_KEY);
      try {
        return savedPayments ? JSON.parse(savedPayments) : [];
      } catch (e) {
        console.error("Failed to parse student payments from localStorage", e);
        localStorage.removeItem(STUDENT_PAYMENTS_STORAGE_KEY);
        return [];
      }
    }
    return [];
  });

  // Fetch dues and payments from backend API when configured
  useEffect(() => {
    const canUseApi = isApiConfigured();
    if (!canUseApi) return;
    const fetchData = async () => {
      try {
        const [duesResp, paymentsResp] = await Promise.all([
          DuesApi.listDues(token),
          PaymentsApi.listAllPayments(token),
        ]);
        setDues(duesResp || []);
        setStudentPayments(paymentsResp || []);
      } catch (err) {
        console.error('Failed to fetch dues/payments from API', err);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!isApiConfigured() && typeof window !== 'undefined') {
      localStorage.setItem(DUES_DEFINITIONS_STORAGE_KEY, JSON.stringify(dues));
    }
  }, [dues]);

  useEffect(() => {
    if (!isApiConfigured() && typeof window !== 'undefined') {
      localStorage.setItem(STUDENT_PAYMENTS_STORAGE_KEY, JSON.stringify(studentPayments));
    }
  }, [studentPayments]);


  const addDue = useCallback(async (newDueData: Omit<Due, 'id'>) => {
    if (isApiConfigured()) {
      try {
        const created = await DuesApi.addDue(newDueData, token);
        setDues((prev) => [...prev, created]);
      } catch (err) {
        console.error('Failed to add due via API', err);
      }
      return;
    }
    setDues((prevDues) => {
      const newId = (Math.max(0, ...prevDues.map(d => parseInt(d.id, 10) || 0)) + 1).toString();
      const dueDefinition: Due = { ...newDueData, id: newId };
      return [...prevDues, dueDefinition];
    });
  }, [token]);

  const removeDue = useCallback(async (dueIdToRemove: string) => {
    const dueToRemove = dues.find(d => d.id === dueIdToRemove);
    if (isApiConfigured()) {
      try {
        await DuesApi.removeDue(dueIdToRemove, token);
      } catch (err) {
        console.error('Failed to remove due via API', err);
      }
    }
    setDues((prevDues) => prevDues.filter(due => due.id !== dueIdToRemove));
    setStudentPayments((prevPayments) => prevPayments.filter(payment => payment.dueId !== dueIdToRemove));
    if (dueToRemove) {
      toast({
        title: "Due Removed",
        description: `The due "${dueToRemove.description}" has been successfully removed.`,
      });
    }
  }, [dues, token]);

  const recordStudentPayment = useCallback(async (dueId: string, studentId: string) => {
    if (isApiConfigured()) {
      try {
        const created = await DuesApi.recordPayment(dueId, token);
        if (created) {
          setStudentPayments((prev) => [...prev, created]);
        }
        return;
      } catch (err) {
        console.error('Failed to record payment via API', err);
      }
    }
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
  }, [token]);

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
