import type mongoose from 'mongoose';
import type { instanceState } from './enums.js';
import type { containerConfig, ICftInstanceContainer } from './dockerTypes.js';
import type { Request } from 'express';
import type { IUserModel } from './userTypes.js';
export declare enum ctfDifficulty {
    EASY = "EASY",
    MID = "MID",
    HARD = "HARD"
}
interface ITimestamps {
    created_at: Date;
    updated_at: Date;
}
interface IMongoDocument extends ITimestamps {
    _id: mongoose.Types.ObjectId;
}
export interface Ictf {
    name: string;
    description?: string | undefined;
    type: 'WEB_EXPLOIT' | 'BE' | 'OTHER';
    resources: string[];
    withSite: boolean;
    difficulty: ctfDifficulty;
    hints: string[];
    containersConfig?: containerConfig[];
    flag: string;
}
export interface IctfModel extends Ictf, IMongoDocument {
}
export type IctfRes = Omit<Ictf, 'containersConfig' | 'flag'> & {
    id: mongoose.Types.ObjectId;
};
export interface ICtfInstance {
    containers: ICftInstanceContainer[];
    userId: mongoose.Types.ObjectId;
    ctfId: mongoose.Types.ObjectId;
    url: string;
    expiresAt: Date;
    status: instanceState;
}
export type ICtfInstanceRes = Omit<ICtfInstance, 'containers'> & {
    id: mongoose.Types.ObjectId;
};
export interface ICtfInstanceModel extends ICtfInstance, IMongoDocument {
}
export interface reqWithId extends Request {
    userId: mongoose.Types.ObjectId;
    solvedCtf: mongoose.Types.ObjectId[];
    user: IUserModel;
}
export {};
//# sourceMappingURL=ctfTypes.d.ts.map