import { Router } from 'express';
import ctfRoute from './ctfRoute.js';
import authRoute from './authenticationRoute.js';
const mainRoute = Router();
mainRoute.use('/ctfs', ctfRoute);
mainRoute.use('', authRoute);
export default mainRoute;
//# sourceMappingURL=mainRoute.js.map