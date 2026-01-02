import api from './api';

export interface Submission {
  _id: string;
  ctfId: string; // Pas challengeId
  userId: string;
  flag: string;
  correct: boolean;
  submittedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  teamName?: string;
  score: number;
  solvedCount: number;
}

export const submissionService = {
  async submitFlag(challengeId: string, flag: string) {
    const response = await api.patch(`/ctfs/${challengeId}`, { flag });
    return response.data;
  },

  async getMySubmissions(): Promise<Submission[]> {
    const response = await api.get('/submissions/me');
    return response.data.data || [];
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await api.get('/leaderboard');
    return response.data.data || [];
  }
};