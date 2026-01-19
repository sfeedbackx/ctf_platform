import axios from 'axios';
import {
  API_BASE_URL,
  ROUTES,
  LOCAL_STORAGE_KEYS,
  AUTH_PREFIX,
} from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `${AUTH_PREFIX}${token}`;
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
    if (status === 401 && localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN)) {
      console.warn('Unauthorized – token invalid or expired');

      // Clear auth ONCE
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);

      // Hard redirect to reset state
      window.location.replace(ROUTES.LOGIN);
    }

    return Promise.reject(error);
  },
);

export default api;
