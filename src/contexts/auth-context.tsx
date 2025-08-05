
'use client';

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studentNameMap } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  login: (credentials: {email: string, role: 'student' | 'admin'}) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is in localStorage on initial load
    try {
      const storedUser = localStorage.getItem('duesPayUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('duesPayUser'); // Clear corrupted data
    }
    setIsLoading(false);
  }, []);

  const login = (credentials: {email: string, role: 'student' | 'admin'}) => {
    setIsLoading(true);

    // Mock authentication logic
    const emailPrefix = credentials.email.split('@')[0].toLowerCase();
    const studentName = studentNameMap[emailPrefix];

    const mockUser: User = {
      id: credentials.role === 'admin' ? 'admin-user' : `mock-student-${emailPrefix}`,
      email: credentials.email,
      name: credentials.role === 'admin' ? 'Admin User' : (studentName || 'Mock Student'),
      role: credentials.role,
      studentId: credentials.role === 'student' ? (studentName ? `SID-${emailPrefix}123` : 'SID-MOCK123') : undefined,
    };
    
    setUser(mockUser);
    localStorage.setItem('duesPayUser', JSON.stringify(mockUser));
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('duesPayUser');
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
