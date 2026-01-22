import type { Ctf, CtfInstance } from '../types/ctf';
import { API_BASE_URL } from '../utils/constants';

export const ctfService = {
  async getAllCtfs(): Promise<Ctf[]> {
    const response = await fetch(`${API_BASE_URL}/ctfs`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch CTFs' }));
      throw new Error(error.message);
    }

    return response.json();
  },

  async getActiveInstance(): Promise<CtfInstance | null> {
    const response = await fetch(`${API_BASE_URL}/ctfs/instances`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch active instance' }));
      throw new Error(error.message);
    }

    const data = await response.json();
    return data.instance;
  },

  async startInstance(ctfId: string): Promise<CtfInstance> {
    const response = await fetch(`${API_BASE_URL}/ctfs/${ctfId}/instances`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to start instance' }));
      throw new Error(error.message);
    }

    return response.json();
  },

  async stopInstance(instanceId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/ctfs/instances/${instanceId}`,
      {
        method: 'PATCH',
        credentials: 'include',
      },
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to stop instance' }));
      throw new Error(error.message);
    }
  },

  async submitFlag(
    ctfId: string,
    flag: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/ctfs/${ctfId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ flag }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Wrong flag' }));
      throw new Error(error.message);
    }

    return response.json();
  },
};
