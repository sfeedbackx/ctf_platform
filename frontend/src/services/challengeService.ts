import api from './api';

export type ChallengeType =
  | 'WEB_EXPLOIT'
  | 'BINARY_EXPLOIT'
  | 'CRYPTO'
  | 'FORENSICS'
  | 'REVERSE';
export type Difficulty = 'EASY' | 'MID' | 'HARD';

export type Challenge = {
  id: string;
  name: string;
  type: ChallengeType;
  description: string;
  difficulty: Difficulty;
  resources: string[];
  points: number;
  solves: number;
  hints?: string[];
  withSite?: boolean;
  solved?: boolean;
  createdAt: string;
  updatedAt: string;
};

export const challengeService = {
  async getAllChallenges(
    category?: string,
    difficulty?: string,
  ): Promise<Challenge[]> {
    const params = new URLSearchParams();
    if (category) params.append('type', category);
    if (difficulty) params.append('difficulty', difficulty);

    const response = await api.get(`/ctfs?${params.toString()}`);
    return response.data.data || response.data || [];
  },

  async getChallengeById(id: string): Promise<Challenge> {
    const response = await api.get(`/ctfs/${id}`);
    return response.data.data || response.data;
  },

  async submitFlag(challengeId: string, flag: string) {
    const response = await api.patch(`/ctfs/${challengeId}`, { flag });
    return {
      correct: response.data.success || response.data.correct,
      message: response.data.message || 'Invalid flag',
      points: response.data.points || 0,
    };
  },
};
