import { Router } from 'express';
import { login, logout, signUp } from '../controller/authController.js';
import { authLimiter } from '../utils/rateLimitUtils.js';

const authRoute = Router();

authRoute.post('/signup', authLimiter, signUp);

authRoute.post('/login', authLimiter, login);

authRoute.post('/logout', logout);

export default authRoute;
