
'use client';

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { ProfileRow } from '@/lib/supabase/mappers';

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
      const supabase = createSupabaseBrowserClient();
      const { data: signIn, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw error;
      const session = signIn.session;
      if (!session) throw new Error('No session returned');

      const authUser = session.user;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single<ProfileRow>();

      const mappedUser: User = {
        id: authUser.id,
        email: authUser.email || credentials.email,
        name: profile?.name || authUser.email?.split('@')[0] || 'User',
        role: credentials.role, // role gating comes from RLS; optionally map from profile.is_admin
        studentId: profile?.student_id || (credentials.role === 'student' ? credentials.studentId : undefined),
      };

      setUser(mappedUser);
      setToken(session.access_token);
      localStorage.setItem('duesPayUser', JSON.stringify(mappedUser));
      localStorage.setItem('duesPayToken', session.access_token);
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
