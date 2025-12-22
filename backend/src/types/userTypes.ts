import mongoose from 'mongoose';

//  Type for creating a new user (request body)
interface IUserCreateBody {
  email: string;
  password: string;
  confirmPassword: string;
  solvedCtf?: mongoose.Types.ObjectId[];
}

// Type for updating a user (request body)
interface IUserUpdateBody {
  email?: string;
  password?: string;
  solvedCtf?: mongoose.Types.ObjectId[];
}

// Type for login (request body)
interface IUserLoginBody {
  email: string;
  password: string;
}

type IUserCreatedRes = IUser;

interface IJwtUser {
  id: mongoose.Types.ObjectId;
  email: string;
  numberOfSolvedCtf: number;
}

interface IUser {
  id: mongoose.Types.ObjectId;
  email: string;
  numberOfSolvedCtf: number;
  solvedCtf: mongoose.Types.ObjectId[];
}

export type {
  IUserCreateBody,
  IUserUpdateBody,
  IUserLoginBody,
  IUserCreatedRes,
  IUser,
  IJwtUser,
};
