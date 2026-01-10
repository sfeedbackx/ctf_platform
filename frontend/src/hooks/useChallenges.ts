import { useState, useEffect } from 'react';
import { challengeService } from '../services/challengeService';
import type { Challenge } from '../services/challengeService';
export const useChallenges = (category?: string, difficulty?: string) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const data = await challengeService.getAllChallenges(category, difficulty);
        setChallenges(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [category, difficulty]);

  return { challenges, loading, error, refetch: () => setChallenges([]) };
};