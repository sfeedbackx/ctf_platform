import { Router } from 'express';
import { signUp } from '../controller/authController.js';

const authRoute = Router();

authRoute.post('/v1/signup', signUp);

authRoute.get('/v1/login', (req, res) => {
  res.send('auth');
});
authRoute.get('/v1/logout', (req, res) => {
  res.send('auth');
});

export default authRoute;
