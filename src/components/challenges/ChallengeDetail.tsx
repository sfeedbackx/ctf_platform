import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challengeService } from '../../services/challengeService';
import type { Challenge } from '../../services/challengeService';
import { submissionService } from '../../services/submissionService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import './ChallengeDetail.css';

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [flag, setFlag] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) return;
      try {
        const data = await challengeService.getChallengeById(id);
        setChallenge(data);
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
      const result = await submissionService.submitFlag(id, flag);
      
      if (result.correct) {
        setMessage({ type: 'success', text: `🎉 Correct! You earned ${challenge?.points} points!` });
        setFlag('');
        await refreshUser();
        
        // Refresh challenge to show it's solved
        const updatedChallenge = await challengeService.getChallengeById(id);
        setChallenge(updatedChallenge);
      } else {
        setMessage({ type: 'error', text: '❌ Incorrect flag. Try again!' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Submission failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!challenge) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="challenge-detail">
      <div className="challenge-detail-header">
        <h1>{challenge.title}</h1>
        {challenge.solved && <span className="badge-solved-large">✓ Solved</span>}
      </div>

      <div className="challenge-detail-info">
        <span className="info-item">📁 {challenge.category}</span>
        <span className="info-item">📊 {challenge.difficulty}</span>
        <span className="info-item">⭐ {challenge.points} points</span>
        <span className="info-item">👥 {challenge.solves} solves</span>
      </div>

      <div className="challenge-detail-content">
        <h2>Description</h2>
        <p>{challenge.description}</p>

        {challenge.hints && challenge.hints.length > 0 && (
          <div className="challenge-hints">
            <h3>💡 Hints</h3>
            <ul>
              {challenge.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        {challenge.files && challenge.files.length > 0 && (
          <div className="challenge-files">
            <h3>📎 Files</h3>
            {challenge.files.map((file, index) => (
              <a key={index} href={file} download className="file-link">
                Download File {index + 1}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="challenge-submit">
        <h2>Submit Flag</h2>
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="FLAG{...}"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            disabled={challenge.solved}
          />
          <Button type="submit" loading={loading} disabled={challenge.solved}>
            {challenge.solved ? 'Already Solved' : 'Submit Flag'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChallengeDetail;