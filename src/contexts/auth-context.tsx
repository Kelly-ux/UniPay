
'use client';

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define the map at the module level for known student names in mock data
const studentNameMap: Record<string, string> = {
  "alice": "Alice Wonderland",
  "bob": "Bob The Builder",
  "charlie": "Charlie Brown",
  "diana": "Diana Prince",
  "edward": "Edward Scissorhands",
  "fiona": "Fiona Gallagher",
  "harry": "Harry Potter",
  "hermione": "Hermione Granger",
};

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
      const savedUser = localStorage.getItem('uniPayUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('uniPayUser');
    }
    setIsLoading(false);
  }, []);

  const login = (userDataFromLoginPage: User) => {
    // userDataFromLoginPage typically has 'name' as the email prefix
    let userToStore = { ...userDataFromLoginPage }; // Create a mutable copy

    if (userToStore.role === 'student') {
      const emailPrefix = userToStore.email.split('@')[0].toLowerCase();
      const mappedFullName = studentNameMap[emailPrefix];
      if (mappedFullName) {
        userToStore.name = mappedFullName; // Update name to full name if a mapping exists
      }
      // If no mapping, userToStore.name remains the email prefix from login page
    }

    setUser(userToStore);
    localStorage.setItem('uniPayUser', JSON.stringify(userToStore));
    
    if (userToStore.role === 'admin') {
      router.push('/'); 
    } else {
      router.push('/');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('uniPayUser');
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
