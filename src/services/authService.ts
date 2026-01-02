// src/services/authService.ts - FULLY FIXED
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

const AUTH_BASE_URL = 'http://localhost:3000/api/auth';  // Backend exact

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ token: string; user?: User }> {
    const response: AxiosResponse = await axios.post(`${AUTH_BASE_URL}/login`, credentials);
    const { token } = response.data;
    
    if (token) {
      localStorage.setItem('token', token);
    }
    
    return response.data;
  },

  async register(data: RegisterData): Promise<any> {
    const response: AxiosResponse = await axios.post(`${AUTH_BASE_URL}/signup`, data);
    return response.data;
  },

  // ✅ Fixed: Simple token check (no /me API call)
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  async logout(): Promise<void> {
    try {
      await axios.post(`${AUTH_BASE_URL}/logout`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      // Logout endpoint optional - ignore errors
      console.log('Logout endpoint not available');
    } finally {
      localStorage.removeItem('token');
      // Clear axios token if using shared api
      delete (axios.defaults.headers.common as any)['Authorization'];
    }
  },

  // ✅ Get user from localStorage (no API call)
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },

  // ✅ Save user data after login
  saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearUser(): void {
    localStorage.removeItem('user');
  }
};
