import React from 'react';
import type { Ctf } from '../../types/ctf';
import './ChallengeCard.css';

interface ChallengeCardProps {
  challenge: Ctf;
  onClick: () => void;
  isSolved?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onClick,
  isSolved = false,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'green';
      case 'mid':
        return 'orange';
      case 'hard':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div
      className={`challenge-card ${isSolved ? 'challenge-card-solved' : ''}`}
      onClick={onClick}
    >
      <div className="challenge-header">
        <h3>{challenge.name}</h3>
        {isSolved && <span className="challenge-solved-badge">✓ Solved</span>}
      </div>

      <p className="challenge-description">
        {challenge.description || 'No description available'}
      </p>

      <div className="challenge-footer">
        <span className="challenge-category">{challenge.type}</span>
        <span
          className={`challenge-difficulty ${getDifficultyColor(challenge.difficulty)}`}
        >
          {challenge.difficulty}
        </span>
      </div>
    </div>
  );
};

export default ChallengeCard;
