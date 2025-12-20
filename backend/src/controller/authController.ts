import type { NextFunction, Request, Response } from 'express';
import type { IUserCreateBody, IUserCreatedRes } from '../types/userTypes.js';
import User from '../models/userModel.js';
import { hashPassword } from '../utils/hashUtils.js';
import type { AppError } from '../types/errorTypes.js';
import { ERROR_NAME } from '../types/errorTypes.js';
import { HTTP_CODE } from '../types/httpCodes.js';

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
        status: HTTP_CODE.BAD_REQUEST,
      };
      return next(fieldMissingError);
    }

    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      const emailUsedError: AppError = {
        name: ERROR_NAME.VALIDATION_ERROR.toString(),
        message: 'Email already used',
        status: HTTP_CODE.BAD_REQUEST,
      };
      return next(emailUsedError);
    }

    if (password !== confirmPassword) {
      const passwordConfirmationError: AppError = {
        name: ERROR_NAME.VALIDATION_ERROR.toString(),
        message: "passwords don't match",
        status: HTTP_CODE.BAD_REQUEST,
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

    res.status(HTTP_CODE.CREATED).json(userResponse);
  } catch (error: unknown) {
    next(error);
  }
};
