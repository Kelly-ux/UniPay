
'use client';

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studentNameMap } from '@/lib/mock-data'; // Import studentNameMap

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('duesPayUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('duesPayUser');
    }
    setIsLoading(false);
  }, []);

  const login = (userDataFromLoginPage: User) => {
    // This function creates a more realistic mock user based on email.
    // It's a bridge until a real backend provides user data.
    let userToStore = { ...userDataFromLoginPage };
    const emailPrefix = userToStore.email.split('@')[0].toLowerCase();
    
    // If the user logging in has a name we've mapped, use it for a better demo experience
    if (userToStore.role === 'student') {
        const mappedFullName = studentNameMap[emailPrefix];
        if(mappedFullName) {
            userToStore.name = mappedFullName;
        }
        // Assign a predictable ID for mock students so their payments can be tracked consistently.
        userToStore.id = `mock-student-${emailPrefix}`;
    } else if (userToStore.role === 'admin') {
        userToStore.id = 'admin-user'; // Fixed ID for any admin user
        userToStore.name = "Admin";
    }

    setUser(userToStore);
    localStorage.setItem('duesPayUser', JSON.stringify(userToStore));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('duesPayUser');
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
