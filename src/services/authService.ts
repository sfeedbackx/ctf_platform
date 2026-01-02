import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  teamName?: string;
}

export interface User {
  _id: string; // MongoDB utilise _id
  username: string;
  email: string;
  role: string;
  score: number;
  teamName?: string;
  solvedCtf: string[]; // Array d'IDs de challenges résolus
  nbSolvedCtf: number; // Nombre de challenges résolus
  createdAt: string;
  updatedAt: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    // ✅ CHANGÉ: /auth/login → /login
    const response = await api.post('/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    // Le backend retourne: { token: string, user: User }
    return {
      token: response.data.token,
      user: response.data.user
    };
  },

  async register(data: RegisterData) {
    // ✅ CHANGÉ: /auth/register → /signup
    const response = await api.post('/signup', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    // Option 1: Appeler un endpoint /me (si tu le crées dans le backend)
    // const response = await api.get('/me');
    // return response.data.data;
    
    // Option 2: Décoder le JWT côté client (pour éviter un appel API)
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    
    try {
      // Décoder le payload du JWT (partie centrale)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Le JWT contient: { userId, email, role, iat, exp }
      const response = await api.get('/me'); // Créer cet endpoint backend
      return response.data.data;
    } catch (error) {
      localStorage.removeItem('token');
      throw new Error('Invalid token');
    }
  },

  logout() {
    api.post('/logout').finally(() => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    });
  }
};