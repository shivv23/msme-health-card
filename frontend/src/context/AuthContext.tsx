import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, RegisterData, UpdateProfileData, ChangePasswordData } from '../types';
import * as api from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const userData = await api.getMe();
      setUser(userData);
    } catch {
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('auth_token', res.access_token);
    setUser(res.user);
  };

  const register = async (data: RegisterData) => {
    await api.register(data);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = '/login';
  };

  const updateProfile = async (data: UpdateProfileData) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
  };

  const changePassword = async (data: ChangePasswordData) => {
    await api.changePassword(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
