
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
    let userToStore = { ...userDataFromLoginPage };
    const emailPrefix = userToStore.email.split('@')[0].toLowerCase();

    if (userToStore.role === 'student') {
      const mappedFullName = studentNameMap[emailPrefix];
      if (mappedFullName) {
        userToStore.name = mappedFullName;
        userToStore.id = `mock-student-${emailPrefix}`; // Assign predictable ID
      } else {
        // For students not in the map, keep generic ID but still try to make a name
        userToStore.name = userToStore.name || emailPrefix; // Keep provided name or use prefix
        userToStore.id = userToStore.id || Date.now().toString(); // Use provided ID or generate new one
      }
    } else if (userToStore.role === 'admin') {
      // Ensure admin also has a consistent ID if desired, or keep as is
      userToStore.id = userToStore.id || 'admin-user'; // Example consistent ID for admin
      userToStore.name = userToStore.name || 'Admin';
    }


    setUser(userToStore);
    localStorage.setItem('duesPayUser', JSON.stringify(userToStore));
    
    // Redirect logic remains the same
    if (userToStore.role === 'admin') {
      router.push('/'); 
    } else {
      router.push('/');
    }
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
