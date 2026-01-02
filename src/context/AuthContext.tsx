import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ✅ TEMPORARY MOCK - replace with real authService later
const mockAuthService = {
  isAuthenticated: () => !!localStorage.getItem('token'),
  getCurrentUser: (): any => {
    try {
      return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    } catch {
      return null;
    }
  },
  login: async () => ({}),
  saveUser: (user: any) => localStorage.setItem('user', JSON.stringify(user)),
  logout: async () => localStorage.removeItem('token'),
};

// ✅ EXPORT TYPE
export interface User {
  _id: string;
  username: string;
  email: string;
  score: number;
  teamName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}
export{AuthContext};
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context as AuthContextType;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const tokenExists = mockAuthService.isAuthenticated();
      const savedUser = mockAuthService.getCurrentUser();
      
      setIsAuthenticated(tokenExists);
      if (savedUser) setUser(savedUser);
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // Mock login - replace with real later
      const mockUser: User = {
        _id: '1',
        username: credentials.email.split('@')[0],
        email: credentials.email,
        score: 0
      };
      
      mockAuthService.saveUser(mockUser);
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    // Mock register
    console.log('Registered:', data);
  };

  const logout = async () => {
    mockAuthService.logout();
    mockAuthService.saveUser(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
