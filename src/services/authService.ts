// src/services/authService.ts
import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {  // ✅ ADD THIS
  username: string;
  email: string;
  password: string;
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

export const authService = {
  async login(credentials: LoginCredentials) {
    const { data } = await api.post('/login', credentials);
    return data;
  },

  async register(data: RegisterData) {
    const { data: response } = await api.post('/signup', data);
    return response;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get('/me');
    return data.data;
  },

  async logout() {
    await api.post('/logout');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};
