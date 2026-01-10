export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const CATEGORIES = [
  { id: 'web', name: 'Web', icon: '🌐' },
  { id: 'crypto', name: 'Cryptography', icon: '🔐' },
  { id: 'reverse', name: 'Reverse Engineering', icon: '🔄' },
  { id: 'forensics', name: 'Forensics', icon: '🔍' },
  { id: 'pwn', name: 'Binary Exploitation', icon: '💥' },
];

export const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', color: 'green' },
  { id: 'medium', name: 'Medium', color: 'orange' },
  { id: 'hard', name: 'Hard', color: 'red' },
];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHALLENGES: '/challenges',
  CHALLENGE_DETAIL: '/challenges/:id',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
  ADMIN: '/admin',
};