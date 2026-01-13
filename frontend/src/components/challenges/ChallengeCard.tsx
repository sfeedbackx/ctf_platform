import React from 'react';
import type { Ctf } from '../../types/ctf';
import './ChallengeCard.css';

interface ChallengeCardProps {
  challenge: Ctf;
  onLaunchClick: (ctfId: string, ctfName: string) => void;
  onSubmitFlag?: (ctfId: string) => void;
  hasActiveInstance?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onLaunchClick,
  onSubmitFlag,
  hasActiveInstance = false,
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Since onLaunchClick is always provided, always prevent default navigation
    e.preventDefault();
  };

  const handleLaunchClickInternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLaunchClick(challenge.id, challenge.name);
  };

  const handleSubmitFlagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSubmitFlag?.(challenge.id);
  };

  return (
    <div className="challenge-card" onClick={handleCardClick}>
      <div className="challenge-header">
        <h3>{challenge.name}</h3>
        {/* Solved badge - you'll need to track this in your app state */}
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

      {/* Action buttons - always show since onLaunchClick is required */}
      <div className="challenge-actions" style={{ marginTop: '12px' }}>
        {challenge.withSite ? (
          <button
            onClick={handleLaunchClickInternal}
            disabled={hasActiveInstance}
            className={hasActiveInstance ? 'btn-disabled' : 'btn-primary'}
          >
            {hasActiveInstance
              ? 'Stop Current Instance First'
              : 'Launch Instance'}
          </button>
        ) : (
          <button
            onClick={handleSubmitFlagClick}
            className="btn-success"
          >
            Submit Flag
          </button>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;
