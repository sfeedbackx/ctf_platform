import React, { useState, useEffect } from 'react';
import type { Ctf, CtfInstance } from '../../types/ctf';
import './ChallengeModal.css';

interface ChallengeModalProps {
  challenge: Ctf;
  isOpen: boolean;
  onClose: () => void;
  onLaunchInstance: (ctfId: string, ctfName: string) => void;
  onSubmitFlag: (flag: string) => void;
  activeInstance?: CtfInstance | null;
  onStopInstance: () => void;
  isLoading?: boolean;
  isSolved?: boolean;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  challenge,
  isOpen,
  onClose,
  onLaunchInstance,
  onSubmitFlag,
  activeInstance = null,
  onStopInstance,
  isLoading = false,
  isSolved = false,
}) => {
  const [flag, setFlag] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Timer for active instance
  useEffect(() => {
    if (!activeInstance) {
      setTimeLeft('');
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(activeInstance.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeInstance]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flag.trim()) {
      onSubmitFlag(flag);
      setFlag('');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#10b981';
      case 'mid':
        return '#f97316';
      case 'hard':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="challenge-modal-overlay" onClick={handleBackdropClick}>
      <div className="challenge-modal">
        <div className="challenge-modal-header">
          <div className="challenge-modal-title-section">
            <h2>{challenge.name}</h2>
            <div className="challenge-modal-badges">
              <span className="challenge-modal-category">{challenge.type}</span>
              <span
                className="challenge-modal-difficulty"
                style={{
                  backgroundColor: getDifficultyColor(challenge.difficulty),
                }}
              >
                {challenge.difficulty}
              </span>
              {isSolved && (
                <span className="challenge-modal-solved-badge">✓ Solved</span>
              )}
            </div>
          </div>
          <button className="challenge-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="challenge-modal-body">
          <div className="challenge-modal-section">
            <h3>Description</h3>
            <p className="challenge-modal-description">
              {challenge.description || 'No description available'}
            </p>
          </div>

          {challenge.hints && challenge.hints.length > 0 && (
            <div className="challenge-modal-section">
              <div className="challenge-modal-hints-header">
                <h3>Hints</h3>
                <button
                  className="challenge-modal-hints-toggle"
                  onClick={() => setShowHints(!showHints)}
                >
                  {showHints ? 'Hide Hints' : 'Show Hints'}
                </button>
              </div>
              {showHints && (
                <ul className="challenge-modal-hints-list">
                  {challenge.hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {challenge.withSite && (
            <div className="challenge-modal-section">
              <h3>Instance</h3>
              {activeInstance ? (
                <div className="challenge-modal-instance-active">
                  <div className="instance-info">
                    {activeInstance.status === 'PENDING' ? (
                      <p className="instance-status-pending">
                        <span className="pulse">⏳</span> Starting instance...
                      </p>
                    ) : (
                      <>
                        <p className="instance-link">
                          🔗{' '}
                          <a
                            href={activeInstance.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open Challenge Instance
                          </a>
                        </p>
                        <p className="instance-timer">
                          ⏱️ Expires in: <strong>{timeLeft}</strong>
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    className="challenge-modal-stop-btn"
                    onClick={onStopInstance}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Stoping...' : 'Stop Instance'}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    className="challenge-modal-launch-btn"
                    onClick={() =>
                      onLaunchInstance(challenge.id, challenge.name)
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? 'Launching...' : 'Start Instance'}
                  </button>
                </>
              )}
            </div>
          )}

          {challenge.resources && challenge.resources.length > 0 && (
            <div className="challenge-modal-section">
              <h3>Resources</h3>
              <ul className="challenge-modal-resources-list">
                {challenge.resources.map((resource, index) => (
                  <li key={index}>
                    <a
                      href={resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="challenge-modal-resource-link"
                    >
                      {resource}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="challenge-modal-section">
            <h3>Submit Flag</h3>
            {isSolved ? (
              <div className="challenge-modal-solved-message">
                <div className="challenge-modal-solved-icon">🎉</div>
                <p>Congratulations! You have already solved this challenge.</p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="challenge-modal-flag-form"
              >
                <input
                  type="text"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="cll{...}"
                  className="challenge-modal-flag-input"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="challenge-modal-submit-btn"
                  disabled={!flag.trim() || isLoading}
                >
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
