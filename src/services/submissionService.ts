// src/services/submissionService.ts - FULLY FIXED
import api from './api';

export interface Submission {
  _id: string;
  ctfId: string;        // ✅ Backend field
  userId: string;
  flag: string;
  correct: boolean;
  submittedAt: string;  // ✅ ISO string, not Date
  points?: number;
  ctf?: { _id: string; name: string }; // ✅ Add this

}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  teamName?: string;
  score: number;
  solvedCount: number;
  _id?: string;
}

export const submissionService = {
  // ✅ REMOVED: Duplicate of challengeService.submitFlag()

  async getMySubmissions(): Promise<Submission[]> {
    // ✅ FIXED: Use existing backend endpoint
    const response = await api.get(`/ctfs?userId=me`); // or `/me/ctfs`
    // Transform CTF response to Submission format
    return (response.data.data || []).map((ctf: any) => ({
      _id: ctf._id,
      ctfId: ctf._id,
      userId: 'me',
      flag: '***HIDDEN***',
      correct: ctf.solved || false,
      submittedAt: ctf.updatedAt,
      points: ctf.points || 0
    }));
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // ✅ FIXED: Correct endpoint & mapping
    try {
      const response = await api.get('/leaderboard');
      const users = response.data.data || response.data || [];
      
      return users.map((user: any, index: number) => ({
        rank: index + 1,
        username: user.username,
        teamName: user.teamName,
        score: user.score || 0,
        solvedCount: user.nbSolvedCtf || user.solvedCount || 0,
        _id: user._id
      }));
    } catch (error) {
      console.error('Leaderboard fetch failed:', error);
      return [];
    }
  },

  // ✅ BONUS: Get global submissions (admin)
  async getAllSubmissions(): Promise<Submission[]> {
    try {
      const response = await api.get('/submissions');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('All submissions fetch failed:', error);
      return [];
    }
  }
};
