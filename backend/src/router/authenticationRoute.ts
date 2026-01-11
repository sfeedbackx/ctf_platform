import { Router } from 'express';
import { login, logout, signUp } from '../controller/authController.js';
import { authLimiter } from '../utils/rateLimitUtils.js';

const authRoute = Router();

authRoute.post('/signup' , signUp);

authRoute.post('/login', login);

authRoute.post('/logout', logout);

export default authRoute;
