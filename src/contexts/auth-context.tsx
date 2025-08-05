
'use client';

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (credentials: {email: string, password: string}) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // In a real app, you would validate the token with the backend here.
        // For this implementation, we will decode it.
        const userData = JSON.parse(atob(token.split('.')[1]));
        setUser(userData);
      }
    } catch (e) {
      console.error("Failed to parse user from token", e);
      localStorage.removeItem('authToken');
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: {email: string, password: string}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }
      
      const { user: loggedInUser, token } = data;
      
      setUser(loggedInUser);
      localStorage.setItem('authToken', token);
      localStorage.setItem('duesPayUser', JSON.stringify(loggedInUser)); // For legacy compatibility if needed, can be removed later.

    } catch (err: any) {
      setError(err.message);
      throw err; // Re-throw to be caught by the form
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('duesPayUser');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
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
