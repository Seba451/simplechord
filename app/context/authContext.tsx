

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserService, authService, logoutService } from '../services/auth';

interface User {
  usuario: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const refreshUser = async () => {
    try {
      const userData = await getUserService();
      setUser(userData);
    } catch {
      setUser(null);
    }
  };

  const login = async (usernameOrEmail: string, password: string) => {
    await authService.login({ usernameOrEmail, password });
    await refreshUser();
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};