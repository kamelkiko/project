import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../utils/api';

interface User {
  id: string;
  username: string;
  email: string;
  plan: string;
  messageLimit: number;
  messagesUsed: number;
  maxSessions: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, plan?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const response = await apiRequest('/api/auth/me');
      if (response.success) {
        setUser(response.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Login failed');
    }

    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  const register = async (username: string, email: string, password: string, plan = 'free') => {
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, plan }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Registration failed');
    }

    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};