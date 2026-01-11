import type { Ctf, CtfInstance } from '../types/ctf';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const ctfService = {
  // =========================
  // Get all CTFs (public)
  // =========================
  async getAllCtfs(): Promise<Ctf[]> {
    const response = await fetch(`${API_BASE_URL}/ctfs`, {
      credentials: 'include', // Send cookies
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch CTFs' }));
      throw new Error(error.message);
    }

    return response.json();
  },

  // =========================
  // Get active instance
  // =========================
  async getActiveInstance(): Promise<CtfInstance | null> {
    const response = await fetch(`${API_BASE_URL}/ctfs/instances`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch active instance' }));
      throw new Error(error.message);
    }

    const data = await response.json();
    return data.instance;
  },

  // =========================
  // Start a CTF instance
  // =========================
  async startInstance(ctfId: string): Promise<CtfInstance> {
    const response = await fetch(`${API_BASE_URL}/ctfs/${ctfId}/instances`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to start instance' }));
      throw new Error(error.message);
    }

    return response.json();
  },

  // =========================
  // Stop a running instance
  // =========================
  async stopInstance(instanceId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ctfs/instances/${instanceId}`, {
      method: 'PATCH',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to stop instance' }));
      throw new Error(error.message);
    }
  },

  // =========================
  // Submit flag
  // =========================
  async submitFlag(
    ctfId: string,
    flag: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/ctfs/${ctfId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ flag }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Wrong flag' }));
      throw new Error(error.message);
    }

    return response.json();
  },
};
