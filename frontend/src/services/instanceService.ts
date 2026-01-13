import api from './api';

export type InstanceStatus = 'RUNNING' | 'STOPPED';

export interface Instance {
  _id: string;           // MongoDB instance ID
  containers: string[];  // Container IDs
  userId: string;
  ctfId: string;         // Challenge ID
  mainUrl: string;       // URL for user to access the instance
  expiresAt: string;     // Expiration date
  status: InstanceStatus;
  createdAt: string;
  updatedAt: string;
}

export const instanceService = {
  /**
   * Start a new instance for a challenge
   */
  async startInstance(challengeId: string): Promise<Instance> {
    const response = await api.post(`/ctfs/${challengeId}/instances`, null, {
      withCredentials: true,
    });
    return response.data || response.data.data; // handles both response shapes
  },

  /**
   * Get the current user's active instance (if any)
   */
  async getActiveInstance(): Promise<Instance | null> {
    const response = await api.get(`/ctfs/instances`, {
      withCredentials: true,
    });
    // Backend returns: { success: true, instance: {...} } or null
    return response.data.instance || null;
  },

  /**
   * Stop a running instance
   */
  async stopInstance(instanceId: string) {
    const response = await api.patch(`/ctfs/instances/${instanceId}`, null, {
      withCredentials: true,
    });
    return response.data; // { success: true, message: "CTF instance stopped successfully" }
  },
};
export default instanceService;