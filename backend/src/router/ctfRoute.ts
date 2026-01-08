import { Router } from 'express';
import {
  createCtfInstance,
  getActiveInstance,
  getCtfs,
  stopCtfInstance,
  submitFlag,
} from '../controller/ctfController.js';
import { jwtMiddleware } from '../middlewares/jwtMiddleware.js';
import { instanceLimiter } from '../utils/rateLimitUtils.js';

const ctfRoute = Router();

ctfRoute.get('/', getCtfs);
ctfRoute.post(
  '/:id/instances',
  instanceLimiter,
  jwtMiddleware,
  createCtfInstance,
);
ctfRoute.get('/instances', jwtMiddleware, getActiveInstance);
ctfRoute.patch('/instances/:id', jwtMiddleware, stopCtfInstance);
ctfRoute.patch('/:id', jwtMiddleware, submitFlag);

export default ctfRoute;
