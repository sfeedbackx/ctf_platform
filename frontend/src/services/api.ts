import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false, // JWT is in header, not cookies
});

// ✅ Attach token safely to every request
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

// 🚫 DO NOT AUTO-LOGOUT ON EVERY 401
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
