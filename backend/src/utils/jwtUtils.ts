import type { IJwtUser } from '../types/userTypes.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { Error } from 'mongoose';
import type { JWTPayload, TokenValidationResult } from '../types/jwtTypes.js';

export const generateToken = (jwtUser: IJwtUser) => {
  return jwt.sign(jwtUser, config.secret, { expiresIn: config.maxAge });
};

export const tokenValidation = (token: string): TokenValidationResult => {
  try {
    const decoded = jwt.verify(token, config.secret) as JWTPayload;
    return {
      valid: true,
      payload: decoded,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid token',
    };
  }
};
