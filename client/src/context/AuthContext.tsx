import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  teamId?: string;
  teamName?: string;
  ticketId?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  register: (data: any) => Promise<any>;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://cwc-season4-api.onrender.com/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('cwc_jwt_token');
      const storedUser = localStorage.getItem('cwc_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error reading stored auth state:', err);
      localStorage.removeItem('cwc_jwt_token');
      localStorage.removeItem('cwc_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('cwc_jwt_token', newToken);
    localStorage.setItem('cwc_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cwc_jwt_token');
    localStorage.removeItem('cwc_user');
  };

  const register = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Registration failed');
    }

    if (resData.token && resData.user) {
      login(resData.token, resData.user);
    }
    return resData;
  };

  // Interceptor API fetch wrapper with token injection
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      logout();
    }

    return response;
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    register,
    apiFetch,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
