// src/services/submissionService.ts
import api from './api';

export interface Submission {
  _id: string;
  ctfId: string;        
  userId: string;
  flag: string;
  correct: boolean;
  submittedAt: string;  
  points?: number;
  ctf?: { _id: string; name: string };
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
  // ✅ MOCK: user submissions
  async getMySubmissions(): Promise<Submission[]> {
    return [
      {
        _id: 'sub1',
        ctfId: 'ctf1',
        userId: 'me',
        flag: '***HIDDEN***',
        correct: true,
        submittedAt: new Date().toISOString(),
        points: 50,
        ctf: { _id: 'ctf1', name: 'Crypto Challenge' }
      },
      {
        _id: 'sub2',
        ctfId: 'ctf2',
        userId: 'me',
        flag: '***HIDDEN***',
        correct: false,
        submittedAt: new Date().toISOString(),
        points: 0,
        ctf: { _id: 'ctf2', name: 'Web Exploit' }
      }
    ];
  },

  // ✅ MOCK: leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return [
      { rank: 1, username: 'Alice', score: 120, solvedCount: 10, _id: 'u1' },
      { rank: 2, username: 'Bob', score: 100, solvedCount: 8, _id: 'u2' },
      { rank: 3, username: 'Charlie', score: 80, solvedCount: 6, _id: 'u3' },
      { rank: 4, username: 'David', score: 60, solvedCount: 4, _id: 'u4' },
      { rank: 5, username: 'Eve', score: 50, solvedCount: 3, _id: 'u5' }
    ];
  },

  // ✅ MOCK: all submissions (for admin/testing)
  async getAllSubmissions(): Promise<Submission[]> {
    return [
      {
        _id: 'sub1',
        ctfId: 'ctf1',
        userId: 'u1',
        flag: '***HIDDEN***',
        correct: true,
        submittedAt: new Date().toISOString(),
        points: 50,
        ctf: { _id: 'ctf1', name: 'Crypto Challenge' }
      },
      {
        _id: 'sub2',
        ctfId: 'ctf2',
        userId: 'u2',
        flag: '***HIDDEN***',
        correct: false,
        submittedAt: new Date().toISOString(),
        points: 0,
        ctf: { _id: 'ctf2', name: 'Web Exploit' }
      }
    ];
  }
};
