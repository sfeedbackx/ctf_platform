import api from './api';

type InstanceStatus = 'running' | 'stopped'; // No enum

export interface Instance {
  _id: string; //  MongoDB utilise _id
  containers: string[]; // Array de Container IDs
  userId: string;
  ctfId: string; // ID du challenge
  mainUrl: string; // URL pour accéder à l'instance
  expiredAt: string; // Date d'expiration
  status: InstanceStatus;
  createdAt: string;
  updatedAt: string;
}

export const instanceService = {
  /**
   * Démarrer une nouvelle instance pour un challenge
   */
  async startInstance(challengeId: string): Promise<Instance> {
    // ✅ POST /api/v1/ctfs/:id/instances
    const response = await api.post(`/ctfs/${challengeId}/instances`);
    return response.data.data || response.data;
  },

  /**
   * Récupérer les instances actives de l'utilisateur
   */
  async getActiveInstances(): Promise<Instance[]> {
    // ✅ GET /api/v1/ctfs/instances
    const response = await api.get('/ctfs/instances');
    return response.data.data || response.data || [];
  },

  /**
   * Récupérer une instance spécifique
   */
  async getInstance(instanceId: string): Promise<Instance> {
    // ⚠️ Endpoint à créer dans le backend si nécessaire
    const response = await api.get(`/ctfs/instances/${instanceId}`);
    return response.data.data || response.data;
  },

  /**
   * Arrêter une instance
   */
  async stopInstance(instanceId: string) {
    // ✅ PATCH /api/v1/ctfs/instances/:id
    const response = await api.patch(`/ctfs/instances/${instanceId}`);
    return response.data;
  },
};
