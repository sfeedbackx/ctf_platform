import api from './api';

export interface Challenge {
  _id: string; // MongoDB utilise _id
  type: 'WEB_EXPLOIT' | 'BINARY_EXPLOIT' | 'CRYPTO' | 'FORENSICS' | 'REVERSE';
  title: string;
  description: string;
  category: string;
  points: number;
  difficulty: 'EASY' | 'MID' | 'HARD';
  solves: number;
  solved?: boolean;
  hints?: string[];
  files?: string[];
  withShell: boolean;
  resources: string[];
  containers: Container[];
  flag: string; // Jamais envoyé au frontend !
  createdAt: string;
  updatedAt: string;
}

interface Container {
  serviceName: string;
  image: string;
  internalPort: number;
  exposed: boolean;
  env: Record<string, string>;
}

export const challengeService = {
  async getAllChallenges(category?: string, difficulty?: string): Promise<Challenge[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    
    // ❌ ANCIEN: GET /challenges
    // ✅ NOUVEAU: GET /api/v1/ctfs
    const response = await api.get(`/ctfs?${params.toString()}`);
    return response.data.data || response.data;
  },

  async getChallengeById(id: string): Promise<Challenge> {
    // ❌ ANCIEN: GET /challenges/:id
    // ✅ NOUVEAU: GET /api/v1/ctfs/:id
    const response = await api.get(`/ctfs/${id}`);
    return response.data.data || response.data;
  },

  async createChallenge(data: Partial<Challenge>) {
    // Admin only
    // ✅ POST /api/v1/ctfs
    const response = await api.post('/ctfs', data);
    return response.data;
  },

  async updateChallenge(id: string, data: Partial<Challenge>) {
    // Admin only
    const response = await api.patch(`/ctfs/${id}`, data);
    return response.data;
  },

  async deleteChallenge(id: string) {
    // Admin only
    const response = await api.delete(`/ctfs/${id}`);
    return response.data;
  }
};