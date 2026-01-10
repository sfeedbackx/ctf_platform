export type CtfDifficulty = 'EASY' | 'MID' | 'HARD';
export type CtfType = 'WEB_EXPLOIT' | 'BE' | 'OTHER';
export type InstanceState = 'RUNNING' | 'STOPPED' | 'PENDING' | 'FAILED' | 'TERMINATED';

export interface Ctf {
  id: string;
  name: string;
  type: CtfType;
  description?: string;
  difficulty: CtfDifficulty;
  hints: string[];
  resources: string[];
  withSite: boolean;
}

export interface CtfInstance {
  id: string;
  ctfId: string;
  userId: string;
  status: InstanceState;
  url?: string;
  expiresAt: Date;
}