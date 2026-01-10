import { Router } from 'express';
import { login, logout, signUp } from '../controller/authController.js';
const authRoute = Router();
authRoute.post('/signup', signUp);
authRoute.post('/login', login);
authRoute.post('/logout', logout);
export default authRoute;
//# sourceMappingURL=authenticationRoute.js.map