import mongoose from 'mongoose';

// 2. Type for creating a new user (request body)
interface IUserCreateBody {
  email: string;
  password: string;
  confirmPassword: string;
  solvedCtf?: mongoose.Types.ObjectId[]; // Optional
}

// 3. Type for updating a user (request body)
interface IUserUpdateBody {
  email?: string;
  password?: string;
  solvedCtf?: mongoose.Types.ObjectId[];
}

// 4. Type for login (request body)
interface IUserLoginBody {
  email: string;
  password: string;
}
interface IUserCreatedRes {
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
};
