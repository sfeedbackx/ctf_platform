import type { Ctf, CtfInstance } from '../types/ctf';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ctfService = {
  getAllCtfs: async (): Promise<Ctf[]> => {
    const response = await fetch(`${API_BASE_URL}/ctfs`, {
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Failed to fetch CTFs');
    return response.json();
  },

  getActiveInstance: async (): Promise<CtfInstance | null> => {
    const response = await fetch(`${API_BASE_URL}/ctfs/instance/active`, {
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Failed to fetch active instance');
    
    const data = await response.json();
    return data.instance;
  },

  startInstance: async (ctfId: string): Promise<CtfInstance> => {
    const response = await fetch(`${API_BASE_URL}/ctfs/${ctfId}/instance`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start instance');
    }
    
    return response.json();
  },

  stopInstance: async (instanceId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/ctfs/instance/${instanceId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Failed to stop instance');
  },

  submitFlag: async (ctfId: string, flag: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/ctfs/${ctfId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ flag }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Wrong flag');
    }
    
    return response.json();
  },
};
