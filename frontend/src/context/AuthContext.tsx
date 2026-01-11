import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  authService,
  type User,
  type LoginCredentials,
  type RegisterData,
} from '../services/authService';

/* =====================
   TYPES
===================== */

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void; // ✅ ADD THIS
}

/* =====================
   CONTEXT (EXPORT IT)
===================== */

export const AuthContext = createContext<AuthContextType | null>(null);

/* =====================
   HOOK
===================== */

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/* =====================
   PROVIDER
===================== */

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Init auth from localStorage
  useEffect(() => {
    refreshUser();
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const user = await authService.login(
      credentials.email,
      credentials.password
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

  // ✅ THIS FIXES YOUR ERROR
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
        refreshUser, // ✅ PROVIDED
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
