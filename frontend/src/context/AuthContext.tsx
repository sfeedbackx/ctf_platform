import React, { useEffect, useState, type ReactNode } from 'react';

import {
  authService,
  type User,
  type LoginCredentials,
  type RegisterData,
} from '../services/authService';
import { AuthContext } from '../hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const user = await authService.login(
      credentials.email,
      credentials.password,
    );
    setUser(user);
  };

  const register = async (data: RegisterData) => {
    await authService.register(data);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = () => {
    const savedUser = authService.getCurrentUser();
    setUser(savedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
