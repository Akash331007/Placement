import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (credentials: FormData) => Promise<void>;
  register: (payload: any) => Promise<void>;
  googleLogin: (payload: { email: string; name: string }) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (payload: any) => Promise<any>;
  verifyEmail: (payload: any) => Promise<any>;
  updateUser: (newUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const profile = await api.get<User>('/auth/me');
          setUser(profile);
        } catch (err) {
          console.error("Failed to load user profile:", err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (credentials: FormData) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Incorrect email or password');
    }
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (payload: any) => {
    await api.post('/auth/register', payload);
  };

  const googleLogin = async (payload: { email: string; name: string }) => {
    const data = await api.post('/auth/google', payload);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    return await api.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (payload: any) => {
    return await api.post('/auth/reset-password', payload);
  };

  const verifyEmail = async (payload: any) => {
    return await api.post('/auth/verify-email', payload);
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        login,
        register,
        googleLogin,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
