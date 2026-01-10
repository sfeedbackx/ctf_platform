// src/components/challenges/ChallengeDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challengeService } from '../../services/challengeService';
import type { Ctf, CtfDifficulty, CtfType } from '../../types/ctf';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import './ChallengeDetail.css';

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [challenge, setChallenge] = useState<Ctf | null>(null);
  const [flag, setFlag] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) return;

      try {
        // Fetch from API
        const dataFromApi: any = await challengeService.getChallengeById(id);

        // Map API data to Ctf type
        const ctfChallenge: Ctf = {
          id: dataFromApi.id || id,
          name: dataFromApi.name || dataFromApi.title || `Challenge ${id}`,
          type: (dataFromApi.type as CtfType) || 'OTHER',
          description: dataFromApi.description || '',
          difficulty: (dataFromApi.difficulty as CtfDifficulty) || 'MID',
          hints: dataFromApi.hints || [],
          resources: dataFromApi.resources || [],
          withSite: dataFromApi.withSite ?? false,
        };

        setChallenge(ctfChallenge);
      } catch (error) {
        console.error('Failed to fetch challenge:', error);
        navigate('/challenges');
      }
    };

    fetchChallenge();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await challengeService.submitFlag(id, flag);

      if (result.correct) {
        setMessage({ type: 'success', text: '🎉 Correct! Flag accepted!' });
        setFlag('');
        await refreshUser();

        // Refresh challenge after submission
        const updatedDataFromApi: any = await challengeService.getChallengeById(id);
        const updatedChallenge: Ctf = {
          id: updatedDataFromApi.id || id,
          name: updatedDataFromApi.name || updatedDataFromApi.title || `Challenge ${id}`,
          type: (updatedDataFromApi.type as CtfType) || 'OTHER',
          description: updatedDataFromApi.description || '',
          difficulty: (updatedDataFromApi.difficulty as CtfDifficulty) || 'MID',
          hints: updatedDataFromApi.hints || [],
          resources: updatedDataFromApi.resources || [],
          withSite: updatedDataFromApi.withSite ?? false,
        };
        setChallenge(updatedChallenge);
      } else {
        setMessage({ type: 'error', text: 'Incorrect flag. Try again!' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Submission failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!challenge) return <div className="loading">Loading...</div>;

  return (
    <div className="challenge-detail">
      <div className="challenge-detail-header">
        <h1>{challenge.name}</h1>
      </div>

      <div className="challenge-detail-info">
        <span className={`category-badge ${challenge.type.toLowerCase()}`}>
          {challenge.type.replace('_', ' ')}
        </span>
        <span className="info-item">{challenge.difficulty}</span>
        <span className="info-item">With Site: {challenge.withSite ? 'Yes' : 'No'}</span>
      </div>

      <div className="challenge-detail-content">
        <h2>Description</h2>
        <p>{challenge.description || 'No description provided.'}</p>

        {challenge.hints.length > 0 && (
          <div className="challenge-hints">
            <h3>💡 Hints</h3>
            <ul>
              {challenge.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        {challenge.resources.length > 0 && (
          <div className="challenge-resources">
            <h3>📚 Resources</h3>
            <ul>
              {challenge.resources.map((res, index) => (
                <li key={index}>{res}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="challenge-submit">
        <h2>Submit Flag</h2>
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="FLAG{...}"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
          />
          <Button type="submit" loading={loading}>
            Submit Flag
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChallengeDetail;
