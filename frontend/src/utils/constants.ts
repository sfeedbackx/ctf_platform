export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHALLENGES: '/challenges',
  CHALLENGE_DETAIL: '/challenges/:id',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
  ADMIN: '/admin',
  LOGOUT: '/logout',
};
