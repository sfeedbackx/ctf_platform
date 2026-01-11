// src/services/authService.ts
import axios, { type AxiosResponse } from 'axios';

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  solvedCtf: string[];
  numberOfSolvedCtf: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// ✅ shared axios config (cookies-based auth)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // REQUIRED for httpOnly cookie
});

export const authService = {
  // ================= REGISTER =================
  async register(data: RegisterData): Promise<User> {
    const response: AxiosResponse<User> = await api.post('/signup', data);
    return response.data;
  },

  // ================= LOGIN =================
  async login(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email or password missing');
    }

    const response: AxiosResponse<{ userWithoutPassword: User }> =
      await api.post('/login', {
        email,
        password,
      });

    const user = response.data.userWithoutPassword;

    // ✅ only store non-sensitive user info
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  },

  // ================= LOGOUT =================
  async logout(): Promise<void> {
    await api.post('/logout');
    localStorage.removeItem('user');
  },

  // ================= CURRENT USER =================
  getCurrentUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },
};

export default authService;
