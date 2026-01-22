import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Only redirect if token exists AND backend explicitly rejects it
    if (status === 401 && localStorage.getItem('token')) {
      console.warn('Unauthorized – token invalid or expired');

      // Clear auth ONCE
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Hard redirect to reset state
      window.location.replace('/login');
    }

    return Promise.reject(error);
  },
);

export default api;
