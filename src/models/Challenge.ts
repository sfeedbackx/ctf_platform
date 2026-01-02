export type ChallengeType =
  | 'WEB_EXPLOIT'
  | 'BINARY_EXPLOIT'
  | 'CRYPTO'
  | 'FORENSICS'
  | 'REVERSE';

export type Difficulty = 'EASY' | 'MID' | 'HARD';

export interface Container {
  serviceName: string;
  image: string;
  internalPort: number;
  exposed: boolean;
  env: Record<string, string>;
}

export interface Challenge {
  _id: string;
  type: ChallengeType;
  title: string;
  description: string;
  category: string;
  points: number;
  difficulty: Difficulty;
  solves: number;
  solved?: boolean;
  hints?: string[];
  withShell: boolean;
  resources: string[];
  containers: Container[];
  createdAt: string;
  updatedAt: string;
}
