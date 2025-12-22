import { Router } from 'express';
import { login, logout, signUp } from '../controller/authController.js';

const authRoute = Router();

authRoute.post('/v1/signup', signUp);

authRoute.post('/v1/login', login);

authRoute.post('/v1/logout', logout);

export default authRoute;
