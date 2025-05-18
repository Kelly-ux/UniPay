
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Due, DueStatus } from '@/lib/mock-data';
import { mockDuesInitial } from '@/lib/mock-data'; // Renamed import
import { format } from 'date-fns';

interface DuesContextType {
  dues: Due[];
  addDue: (newDue: Omit<Due, 'id' | 'status' | 'paymentDate'>) => void;
  updateDueStatus: (dueId: string, status: DueStatus, paymentDate?: Date) => void;
  getDueById: (dueId: string) => Due | undefined;
}

const DuesContext = createContext<DuesContextType | undefined>(undefined);

export const DuesProvider = ({ children }: { children: ReactNode }) => {
  const [dues, setDues] = useState<Due[]>(mockDuesInitial);

  const addDue = useCallback((newDueData: Omit<Due, 'id' | 'status' | 'paymentDate'>) => {
    setDues((prevDues) => {
      const newId = (Math.max(0, ...prevDues.map(d => parseInt(d.id, 10))) + 1).toString();
      const dueWithDefaults: Due = {
        ...newDueData,
        id: newId,
        status: new Date(newDueData.dueDate) < new Date() && !newDueData.dueDate.endsWith('T00:00:00.000Z') // Basic overdue check
          ? 'Overdue' 
          : 'Unpaid',
      };
      return [...prevDues, dueWithDefaults];
    });
  }, []);

  const updateDueStatus = useCallback((dueId: string, status: DueStatus, paymentDateValue?: Date) => {
    setDues((prevDues) =>
      prevDues.map((due) =>
        due.id === dueId
          ? {
              ...due,
              status,
              paymentDate: paymentDateValue ? format(paymentDateValue, 'yyyy-MM-dd') : due.paymentDate,
            }
          : due
      )
    );
  }, []);

  const getDueById = useCallback((dueId: string) => {
    return dues.find(due => due.id === dueId);
  }, [dues]);

  return (
    <DuesContext.Provider value={{ dues, addDue, updateDueStatus, getDueById }}>
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
