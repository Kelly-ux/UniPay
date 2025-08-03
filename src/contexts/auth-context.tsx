
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
    // When a user logs in, we now primarily use the ID they provided during signup.
    // The logic to auto-generate an ID is now a fallback for older mock users.
    let userToStore = { ...userDataFromLoginPage };
    const emailPrefix = userToStore.email.split('@')[0].toLowerCase();

    // The 'id' should come from the user's signup data now.
    // This logic can be simplified once the backend provides the definitive user object on login.
    if (userToStore.role === 'student') {
        // We still map the name for our predefined mock users for demo purposes.
        const mappedFullName = studentNameMap[emailPrefix];
        if (mappedFullName) {
            userToStore.name = mappedFullName;
        }
        // The ID will now be what the user entered at signup, so we don't need to generate it here.
        // We will just use the id that's passed in the userData.
        // For our existing mock data, we might need a transition or just create new users.
        // For now, let's assume the ID is passed correctly.
         userToStore.id = userDataFromLoginPage.id || `student-${Date.now()}`;
    } else if (userToStore.role === 'admin') {
      userToStore.id = userDataFromLoginPage.id || 'admin-user';
      userToStore.name = userToStore.name || 'Admin';
    }


    setUser(userToStore);
    localStorage.setItem('duesPayUser', JSON.stringify(userToStore));
    
    router.push('/');
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
