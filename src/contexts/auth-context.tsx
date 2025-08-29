
'use client';

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/lib/api';
import { isApiConfigured } from '@/lib/env';

// Update login credentials to include studentId
interface LoginCredentials {
  email: string;
  password: string;
  role: 'student' | 'admin';
  studentId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void> | void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user and token are in localStorage on initial load
    try {
      const storedUser = localStorage.getItem('duesPayUser');
      const storedToken = localStorage.getItem('duesPayToken');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('duesPayUser'); // Clear corrupted data
        localStorage.removeItem('duesPayToken');
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      if (isApiConfigured()) {
        const resp = await AuthApi.login({
          email: credentials.email,
          password: credentials.password,
          role: credentials.role,
          studentId: credentials.studentId,
        });
        setUser(resp.user);
        setToken(resp.token);
        localStorage.setItem('duesPayUser', JSON.stringify(resp.user));
        localStorage.setItem('duesPayToken', resp.token);
      } else {
        // Development fallback without mock-data mapping
        const devUser: User = {
          id: credentials.email,
          email: credentials.email,
          name: credentials.email.split('@')[0],
          role: credentials.role,
          studentId: credentials.role === 'student' ? credentials.studentId : undefined,
        };
        setUser(devUser);
        setToken(null);
        localStorage.setItem('duesPayUser', JSON.stringify(devUser));
        localStorage.removeItem('duesPayToken');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('duesPayUser');
    localStorage.removeItem('duesPayToken');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
