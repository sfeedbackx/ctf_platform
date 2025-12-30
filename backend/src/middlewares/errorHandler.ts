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
  if (
    err.statusNumber === HTTP_CODE.INTERNAL_SERVER_ERROR ||
    err.statusNumber === 500
  ) {
    console.error('[ERROR]', err);
    res.status(HTTP_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server',
    });
  } else {
    res.status(err.statusNumber || HTTP_CODE.INTERNAL_SERVER_ERROR).json({
      message: err.message || 'Internal Server Error',
    });
  }
};
