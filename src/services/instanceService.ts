import api from './api';

export interface Instance {
  _id: string;
  containers: string[];
  userId: string;
  ctfId: string;
  mainUrl: string;
  expiredAt: string;
  status: 'running' | 'stopped';
  createdAt: string;
  updatedAt: string;
}

export const instanceService = {
  async createInstance(challengeId: string): Promise<Instance> {
    const response = await api.post(`/ctfs/${challengeId}/instances`);
    return response.data.data;
  },

  async getMyInstances(): Promise<Instance[]> {
    const response = await api.get('/ctfs/instances');
    return response.data.data || [];
  },

  async stopInstance(instanceId: string) {
    const response = await api.patch(`/ctfs/instances/${instanceId}`);
    return response.data;
  }
};