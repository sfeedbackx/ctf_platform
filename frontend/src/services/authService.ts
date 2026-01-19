import axios, { type AxiosResponse } from 'axios';
import { API_BASE_URL, ROUTES, LOCAL_STORAGE_KEYS } from '../utils/constants';

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

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const authService = {
  async register(data: RegisterData): Promise<User> {
    const response: AxiosResponse<User> = await api.post(ROUTES.REGISTER, data);
    return response.data;
  },

  async login(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email or password missing');
    }

    const response: AxiosResponse<{
      userWithoutPassword: User;
      message?: string;
    }> = await api.post(ROUTES.LOGIN, {
      email,
      password,
    });

    const user = response.data.userWithoutPassword;

    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));

    return user;
  },

  async logout(): Promise<void> {
    await api.post(ROUTES.LOGOUT);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },

  updateUser(user: User): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
  },
};

export default authService;
