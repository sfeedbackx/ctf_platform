import type { NextFunction, Request, Response } from 'express';
/**
 * Handles user registration by validating input, checking for existing email,
 * hashing the password, and creating a new user account.
 *
 * @param {Request} req - Express request object containing email, password, confirmPassword.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express error-handling middleware.
 * @returns {Promise<void>} Sends user data on success or passes error to middleware.
 */
export declare const signUp: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Authenticates a user by validating credentials and setting a JWT token cookie.
 *
 * @param {Request} req - Express request object containing email and password.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express error-handling middleware.
 * @returns {Promise<void>} Sends user data with token cookie on success or passes error to middleware.
 */
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Logs out the user by clearing the authentication token cookie.
 *
 * @param {Request} _req - Express request object (unused).
 * @param {Response} res - Express response object.
 * @returns {void} Sends success message.
 */
export declare const logout: (_req: Request, res: Response) => void;
//# sourceMappingURL=authController.d.ts.map