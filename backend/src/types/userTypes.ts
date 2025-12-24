import mongoose, { Document } from 'mongoose';

// Base user credentials
interface IUserCredentials {
  email: string;
  password: string;
}

// Base user info (public fields)
interface IUserBase {
  id: mongoose.Types.ObjectId;
  email: string;
  numberOfSolvedCtf: number;
}

// Full user interface with solved CTFs
export interface IUser extends IUserBase {
  solvedCtf: mongoose.Types.ObjectId[];
}

// JWT payload (minimal user info for token)
export type IJwtUser = IUserBase;

// User registration request body
export interface IUserCreateBody extends IUserCredentials {
  confirmPassword: string;
  solvedCtf?: mongoose.Types.ObjectId[];
}

// User login request body
export type IUserLoginBody = IUserCredentials;

// User update request body (all fields optional)
export interface IUserUpdateBody {
  email?: string;
  password?: string;
  solvedCtf?: mongoose.Types.ObjectId[];
}
// doc type
export interface IUserModel extends Document, IUserCredentials {
  solvedCtf: mongoose.Types.ObjectId[];
  numberOfSolvedCtf: number;
}

// User creation response
export type IUserCreatedRes = IUser;
