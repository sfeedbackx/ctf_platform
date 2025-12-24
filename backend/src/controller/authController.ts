import type { NextFunction, Request, Response } from 'express';
import type {
  IUser,
  IUserCreateBody,
  IUserCreatedRes,
  IUserLoginBody,
} from '../types/userTypes.js';
import User from '../models/userModel.js';
import { checkPassword, hashPassword } from '../utils/hashUtils.js';
import type { AppError } from '../types/errorTypes.js';
import { ERROR_NAME } from '../types/errorTypes.js';
import { HTTP_CODE } from '../types/httpCodes.js';
import { generateToken } from '../utils/jwtUtils.js';
import configEnv from '../config/config.js';

/**
 * Handles user registration by validating input, checking for existing email,
 * hashing the password, and creating a new user account.
 *
 * @param {Request} req - Express request object containing email, password, confirmPassword.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express error-handling middleware.
 * @returns {Promise<void>} Sends user data on success or passes error to middleware.
 */
export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, confirmPassword, solvedCtf } =
      req.body as IUserCreateBody;

    // Guards
    if (!email || !password || !confirmPassword) {
      const fieldMissingError: AppError = {
        name: ERROR_NAME.VALIDATION_ERROR.toString(),
        message: 'Email, password and confirmPassword are required',
        statusNumber: HTTP_CODE.BAD_REQUEST,
      };
      return next(fieldMissingError);
    }

    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      const emailUsedError: AppError = {
        name: ERROR_NAME.VALIDATION_ERROR.toString(),
        message: 'Email already used',
        statusNumber: HTTP_CODE.BAD_REQUEST,
      };
      return next(emailUsedError);
    }

    if (password !== confirmPassword) {
      const passwordConfirmationError: AppError = {
        name: ERROR_NAME.VALIDATION_ERROR.toString(),
        message: "passwords don't match",
        statusNumber: HTTP_CODE.BAD_REQUEST,
      };
      return next(passwordConfirmationError);
    }

    // Creating the user
    const newUser = await User.create({
      email,
      password: await hashPassword(password),
      solvedCtf: solvedCtf || [],
    });

    const userResponse: IUserCreatedRes = {
      id: newUser._id,
      email: newUser.email,
      numberOfSolvedCtf: newUser.numberOfSolvedCtf,
      solvedCtf: newUser.solvedCtf,
    };

    return res.status(HTTP_CODE.CREATED).json(userResponse);
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * Authenticates a user by validating credentials and setting a JWT token cookie.
 *
 * @param {Request} req - Express request object containing email and password.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express error-handling middleware.
 * @returns {Promise<void>} Sends user data with token cookie on success or passes error to middleware.
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body as IUserLoginBody;
  // Guards
  if (!email || !password) {
    const fieldMissingError: AppError = {
      name: ERROR_NAME.VALIDATION_ERROR.toString(),
      message: 'Email and  password are required',
      statusNumber: HTTP_CODE.BAD_REQUEST,
    };
    return next(fieldMissingError);
  }
  const foundUser = await User.findOne({
    email,
  });
  if (!foundUser) {
    const userNotFoundError: AppError = {
      name: ERROR_NAME.VALIDATION_ERROR.toString(),
      message: 'Invalid credentials',
      statusNumber: HTTP_CODE.UNAUTHORIZED,
    };
    return next(userNotFoundError);
  }
  const isPasswordValid = await checkPassword(password, foundUser.password);
  if (!isPasswordValid) {
    const passwordWrongError: AppError = {
      name: ERROR_NAME.VALIDATION_ERROR.toString(),
      message: 'Invalid credentials',
      statusNumber: HTTP_CODE.UNAUTHORIZED,
    };
    return next(passwordWrongError);
  }
  const userToken = generateToken({
    id: foundUser._id,
    numberOfSolvedCtf: foundUser.numberOfSolvedCtf,
    email: foundUser.email,
  });
  res.cookie('token', userToken, {
    httpOnly: true,
    secure: configEnv.nodeEnv === 'production',
    sameSite: 'strict' as const, // CSRF protection
    maxAge: configEnv.maxAge, // 7 days in milliseconds
  });

  const userWithoutPassword: IUser = {
    id: foundUser._id,
    email: foundUser.email,
    numberOfSolvedCtf: foundUser.numberOfSolvedCtf,
    solvedCtf: foundUser.solvedCtf,
  };
  res.status(HTTP_CODE.SUCCESS).json({
    userWithoutPassword,
  });
};

/**
 * Logs out the user by clearing the authentication token cookie.
 *
 * @param {Request} _req - Express request object (unused).
 * @param {Response} res - Express response object.
 * @returns {void} Sends success message.
 */
export const logout = (_req: Request, res: Response) => {
  res.clearCookie('token');

  res.status(HTTP_CODE.SUCCESS).json({
    message: 'Logout successful',
  });
};
