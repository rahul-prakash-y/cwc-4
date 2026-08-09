import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { API_BASE_URL } from '../api/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'superadmin';
  isFirstLogin?: boolean;
  isBlocked?: boolean;
  teamId?: string;
  teamName?: string;
  ticketId?: string;
  avatar?: string;
  themePreference?: 'light' | 'dark';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>, newToken?: string) => void;
  register: (data: any) => Promise<any>;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStudent: boolean;
}

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
    document.cookie = `token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  };

  const updateUser = (updatedFields: Partial<User>, newToken?: string) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = { ...prevUser, ...updatedFields };
      localStorage.setItem('cwc_user', JSON.stringify(updated));
      return updated;
    });
    if (newToken) {
      setToken(newToken);
      localStorage.setItem('cwc_jwt_token', newToken);
      document.cookie = `token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cwc_jwt_token');
    localStorage.removeItem('cwc_user');
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const register = async (data: any) => {
    try {
      const response = await apiClient.post('/auth/register', data);
      const resData = response.data;
      if (resData.token && resData.user) {
        login(resData.token, resData.user);
      }
      return resData;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(msg);
    }
  };

  // Interceptor API fetch wrapper powered by Axios
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    let data: any = undefined;
    if (options.body) {
      if (options.body instanceof FormData) {
        data = options.body;
      } else if (typeof options.body === 'string') {
        try {
          data = JSON.parse(options.body);
        } catch {
          data = options.body;
        }
      } else {
        data = options.body;
      }
    }

    try {
      const response = await apiClient.request({
        url: endpoint,
        method,
        data,
        headers: options.headers as any,
      });

      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        json: async () => response.data,
        text: async () => JSON.stringify(response.data),
        clone: () => ({ json: async () => response.data }),
        data: response.data,
      };
    } catch (err: any) {
      if (err.response) {
        return {
          ok: false,
          status: err.response.status,
          json: async () => err.response.data,
          text: async () => JSON.stringify(err.response.data),
          clone: () => ({ json: async () => err.response.data }),
          data: err.response.data,
        };
      }
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    register,
    apiFetch,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isSuperAdmin: user?.role === 'superadmin',
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
