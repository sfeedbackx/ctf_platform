import { useState, useEffect } from 'react';
import { ctfService } from '../services/ctfService';
import type { Ctf, CtfInstance } from '../types/ctf';

export const useCtf = () => {
  const [ctfs, setCtfs] = useState<Ctf[]>([]);
  const [activeInstance, setActiveInstance] = useState<CtfInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCtfs = async () => {
    try {
      setLoading(true);
      const data = await ctfService.getAllCtfs();
      setCtfs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveInstance = async () => {
    try {
      const instance = await ctfService.getActiveInstance();
      setActiveInstance(instance);
    } catch (err) {
      console.error('Failed to fetch active instance:', err);
    }
  };

  const startInstance = async (ctfId: string) => {
    try {
      setError(null);
      const instance = await ctfService.startInstance(ctfId);
      setActiveInstance(instance);
      return instance;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start instance';
      setError(message);
      throw err;
    }
  };

  const stopInstance = async (instanceId: string) => {
    try {
      setError(null);
      await ctfService.stopInstance(instanceId);
      setActiveInstance(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop instance';
      setError(message);
      throw err;
    }
  };

  const submitFlag = async (ctfId: string, flag: string) => {
    try {
      setError(null);
      const result = await ctfService.submitFlag(ctfId, flag);
      await fetchCtfs();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wrong flag';
      setError(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchCtfs();
    fetchActiveInstance();
  }, []);

  return {
    ctfs,
    activeInstance,
    loading,
    error,
    startInstance,
    stopInstance,
    submitFlag,
    refreshCtfs: fetchCtfs,
    refreshActiveInstance: fetchActiveInstance,
  };
};