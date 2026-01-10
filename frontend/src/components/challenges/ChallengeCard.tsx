import React from 'react';
import type { Ctf } from '../../types/ctf';
import './ChallengeCard.css';

interface ChallengeCardProps {
  challenge: Ctf;
  onStart?: (ctfId: string) => void;
  onSubmitFlag?: (ctfId: string) => void;
  hasActiveInstance?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge, 
  onStart,
  onSubmitFlag,
  hasActiveInstance = false
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'green';
      case 'mid': return 'orange';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If we have action handlers, prevent navigation and use them instead
    if (onStart || onSubmitFlag) {
      e.preventDefault();
      
      if (challenge.withSite && onStart) {
        onStart(challenge.id);
      } else if (!challenge.withSite && onSubmitFlag) {
        onSubmitFlag(challenge.id);
      }
    }
    // Otherwise, let Link handle navigation normally
  };

  return (
    <div className="challenge-card" onClick={handleClick}>
      <div className="challenge-header">
        <h3>{challenge.name}</h3>
        {/* Solved badge - you'll need to track this in your app state */}
      </div>
      
      <p className="challenge-description">
        {challenge.description || 'No description available'}
      </p>
      
      <div className="challenge-footer">
        <span className="challenge-category">{challenge.type}</span>
        <span className={`challenge-difficulty ${getDifficultyColor(challenge.difficulty)}`}>
          {challenge.difficulty}
        </span>
      </div>

      {/* Action buttons if handlers are provided */}
      {(onStart || onSubmitFlag) && (
        <div className="challenge-actions" style={{ marginTop: '12px' }}>
          {challenge.withSite ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStart?.(challenge.id);
              }}
              disabled={hasActiveInstance}
              className={hasActiveInstance ? 'btn-disabled' : 'btn-primary'}
            >
              {hasActiveInstance ? 'Stop Current Instance First' : 'Start Instance'}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSubmitFlag?.(challenge.id);
              }}
              className="btn-success"
            >
              Submit Flag
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ChallengeCard;