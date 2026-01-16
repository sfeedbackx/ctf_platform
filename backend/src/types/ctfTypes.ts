import type mongoose from 'mongoose';
import type { instanceState } from './enums.js';
import type { containerConfig, ICftInstanceContainer } from './dockerTypes.js';
import type { Request } from 'express';
import type { IUserModel } from './userTypes.js';

export enum ctfDifficulty {
  EASY = 'EASY',
  MID = 'MID',
  HARD = 'HARD',
}
// Base interface with common timestamp fields
interface ITimestamps {
  created_at: Date;
  updated_at: Date;
}

// Base interface with MongoDB _id
interface IMongoDocument extends ITimestamps {
  _id: mongoose.Types.ObjectId;
}

// CTF base interface
export interface Ictf {
  name: string;
  description?: string | undefined;
  type: 'WEB_EXPLOIT' | 'BE' | 'OTHER' | 'FORENSICS';
  resources: string[];
  withSite: boolean;
  difficulty: ctfDifficulty;
  hints: string[];
  containersConfig?: containerConfig[];
  flag: string;
}

// CTF with MongoDB fields
export interface IctfModel extends Ictf, IMongoDocument {}

// CTF response (without sensitive fields)
export type IctfRes = Omit<Ictf, 'containersConfig' | 'flag'> & {
  id: mongoose.Types.ObjectId;
};

// CTF Instance base interface
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

// CTF Instance with MongoDB fields
export interface ICtfInstanceModel extends ICtfInstance, IMongoDocument {}

// Request with authenticated user ID
export interface reqWithId extends Request {
  userId: mongoose.Types.ObjectId;
  solvedCtf: mongoose.Types.ObjectId[];
  user: IUserModel;
}
