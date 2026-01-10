import mongoose, { Document } from 'mongoose';
interface IUserCredentials {
    email: string;
    password: string;
}
interface IUserBase {
    id: mongoose.Types.ObjectId;
    email: string;
    numberOfSolvedCtf: number;
}
export interface IUser extends IUserBase {
    solvedCtf: mongoose.Types.ObjectId[];
}
export type IJwtUser = IUserBase;
export interface IUserCreateBody extends IUserCredentials {
    confirmPassword: string;
    solvedCtf?: mongoose.Types.ObjectId[];
}
export type IUserLoginBody = IUserCredentials;
export interface IUserUpdateBody {
    email?: string;
    password?: string;
    solvedCtf?: mongoose.Types.ObjectId[];
}
export interface IUserModel extends Document, IUserCredentials {
    solvedCtf: mongoose.Types.ObjectId[];
    numberOfSolvedCtf: number;
}
export type IUserCreatedRes = IUser;
export {};
//# sourceMappingURL=userTypes.d.ts.map