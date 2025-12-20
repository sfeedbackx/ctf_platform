import type { Request, Response, NextFunction } from 'express';
import type { AppError } from '../types/errorTypes.js';
import { HTTP_CODE } from '../types/httpCodes.js';

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  console.error(err);
  res.status(err.status || HTTP_CODE.INTERNAL_ERROR_CODE).json({
    message: err.message || 'Internal Server Error',
  });
};
