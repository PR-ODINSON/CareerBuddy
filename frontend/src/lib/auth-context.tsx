'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from './api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'COUNSELOR' | 'ADMIN';
  isVerified: boolean;
  university?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  // Additional fields for different roles
  specialization?: string[];
  experience?: number;
  certification?: string;
  rating?: number;
  targetRoles?: string[];
  preferredIndustries?: string[];
  locationPreferences?: string[];
  salaryExpectation?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await apiClient.getProfile();
        setUser(userData);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      const { access_token, user } = response;
      
      localStorage.setItem('token', access_token);
      setUser(user);
      
      // Redirect based on role
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (user.role === 'COUNSELOR') {
        router.push('/counselor');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiClient.register(userData);
      const { access_token, user } = response;
      
      localStorage.setItem('token', access_token);
      setUser(user);
      
      router.push('/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const updateUser = async (userData: any) => {
    try {
      const updatedUser = await apiClient.updateProfile(userData);
      setUser(updatedUser);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
