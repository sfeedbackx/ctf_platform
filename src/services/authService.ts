// src/services/authService.ts
import axios from 'axios';
import type { AxiosResponse } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  teamName?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  score: number;
  teamName?: string;
  solvedCtf: string[];
  nbSolvedCtf: number;
  createdAt: string;
  updatedAt: string;
}

const AUTH_BASE_URL = 'http://localhost:3000/api/auth';

export const authService = {
  // ✅ LOGIN
  async login(
    credentials: LoginCredentials
  ): Promise<{ token: string; user: User }> {
    try {
      const response: AxiosResponse<{ token: string; userWithoutPassword: any }> =
        await axios.post(`${AUTH_BASE_URL}/login`, credentials);

      const { token, userWithoutPassword } = response.data;

      // ✅ Normalize user fields
      const user: User = {
        _id: userWithoutPassword._id,
        username: userWithoutPassword.username || userWithoutPassword.name ||  userWithoutPassword.email.split('@')[0] ,
        email: userWithoutPassword.email || 'noemail@example.com',
        role: userWithoutPassword.role || 'user',
        score: userWithoutPassword.score ?? 0,
        teamName: userWithoutPassword.teamName,
        solvedCtf: userWithoutPassword.solvedCtf ?? [],
        nbSolvedCtf: userWithoutPassword.nbSolvedCtf ?? 0,
        createdAt: userWithoutPassword.createdAt ?? new Date().toISOString(),
        updatedAt: userWithoutPassword.updatedAt ?? new Date().toISOString(),
      };

      // ✅ Persist auth
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { token, user };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      }
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  },

  // ✅ REGISTER
  async register(data: RegisterData): Promise<any> {
    const response: AxiosResponse = await axios.post(`${AUTH_BASE_URL}/signup`, data);
    return response.data;
  },

  // ✅ CHECK AUTH
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // ✅ LOGOUT
  async logout(): Promise<void> {
    try {
      await axios.post(
        `${AUTH_BASE_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
    } catch {
      // backend logout optional
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    }
  },

  // ✅ GET CURRENT USER FROM LOCAL STORAGE
  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? (JSON.parse(user) as User) : null;
  },

  // ✅ SAVE USER (update local storage)
  saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // ✅ CLEAR USER (logout)
  clearUser(): void {
    localStorage.removeItem('user');
  },
};

export default authService;
