import React, { useState } from 'react';
import { useCtf } from '../hooks/useCtf';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/ToastContainer';
import { getErrorMessage } from '../utils/errorHandler';
import ChallengeCard from '../components/challenges/ChallengeCard';
import { ActiveInstanceBanner } from '../components/ActiveInstanceBanner';
import Modal from '../components/common/Modal';
import { ChallengeModal } from '../components/challenges/ChallengeModal';
import './Challenges.css';
import { type CtfInstance, type Ctf } from '../types/ctf';

const ChallengePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const {
    ctfs,
    activeInstance,
    loading,
    error,
    startInstance,
    stopInstance,
    submitFlag,
  } = useCtf();

  const [selectedChallenge, setSelectedChallenge] = useState<Ctf | null>(null);
  const [launchModalCtf, setLaunchModalCtf] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [instanceUrl, setInstanceUrl] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const handleLaunchClick = (ctfId: string, ctfName: string) => {
    setLaunchModalCtf({ id: ctfId, name: ctfName });
  };

  const handleConfirmLaunch = async () => {
    if (!launchModalCtf) return;
    
    try {
      setActionLoading(true);
      const instance = await startInstance(launchModalCtf.id);
      if (instance.url) {
        setInstanceUrl(instance.url);
        showToast('Instance launched successfully!', 'success');
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartInstance = async (ctfId: string) => {
    try {
      setActionLoading(true);
      const instance = await startInstance(ctfId);
      if (instance.url) {
        window.location.href = instance.url;
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopInstance = async () => {
    if (!activeInstance) return;
    const confirmed = window.confirm(
      'Are you sure you want to stop this instance?\n\nYou will need to restart it to continue the challenge.',
    );
    if (!confirmed) return;
    try {
      setActionLoading(true);
      await stopInstance(activeInstance.id);
      showToast('Instance stopped successfully', 'success');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitFlag = async (flag: string) => {
    if (!selectedChallenge) return;
    
    // Check if already solved
    const isSolved = user?.solvedCtf?.includes(selectedChallenge.id);
    if (isSolved) {
      showToast('You have already solved this challenge!', 'info');
      return;
    }
    
    try {
      setActionLoading(true);
      const result = await submitFlag(selectedChallenge.id, flag);
      
      if (result.success) {
        showToast(result.message || 'Flag submitted successfully!', 'success');
        
        // Update user data in localStorage immediately
        if (user) {
          const updatedUser = {
            ...user,
            solvedCtf: [...user.solvedCtf, selectedChallenge.id],
            numberOfSolvedCtf: (user.numberOfSolvedCtf || 0) + 1,
          };
          
          // Update localStorage and refresh context
          const authService = await import('../services/authService');
          authService.default.updateUser(updatedUser);
          refreshUser();
        }
        
        // Close modal
        setSelectedChallenge(null);
      } else {
        showToast(result.message || 'Incorrect flag', 'error');
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Get solved CTF IDs from user
  const solvedCtfIds: string[] = user?.solvedCtf || [];

  const filteredCtfs = ctfs.filter((ctf) => {
    const categoryMatch =
      filterCategory === 'all' || ctf.type === filterCategory;
    const difficultyMatch =
      filterDifficulty === 'all' || ctf.difficulty === filterDifficulty;
    return categoryMatch && difficultyMatch;
  });

  if (loading) {
    return (
      <div className="challenges-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading challenges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="challenges-page">
        <div className="error-container">
          <h2>❌ Error Loading Challenges</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="challenges-page">
      <div className="page-header">
        <h1>CTF Challenges</h1>
        <p>Test your skills across various cybersecurity challenges</p>
        {user && (
          <div className="user-stats">
            <span className="stat-badge">
              🏆 {user.numberOfSolvedCtf || 0} / {ctfs.length} Solved
            </span>
          </div>
        )}
      </div>

      <div className="page-content">
        <div className="categories-sidebar">
          <div className="sidebar-header">
            <h3>Category</h3>
          </div>
          
          <div className="sidebar-top-select">
            <label>Difficulty</label>
            <select 
              value={filterDifficulty} 
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MID">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div className="category-list">
            <button 
              className={`category-item ${filterCategory === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCategory('all')}
            >
              All
            </button>
            <button 
              className={`category-item ${filterCategory === 'WEB_EXPLOIT' ? 'active' : ''}`}
              onClick={() => setFilterCategory('WEB_EXPLOIT')}
            >
              Web Exploit
            </button>
            <button 
              className={`category-item ${filterCategory === 'BE' ? 'active' : ''}`}
              onClick={() => setFilterCategory('BE')}
            >
              Backend
            </button>
            <button 
              className={`category-item ${filterCategory === 'OTHER' ? 'active' : ''}`}
              onClick={() => setFilterCategory('OTHER')}
            >
              Other
            </button>
          </div>
        </div>

        <div className="main-content">
          {activeInstance && (
            <ActiveInstanceBanner instance={activeInstance} onStop={handleStopInstance} />
          )}
          
          <div className="difficulty-radio-group">
            <label className="radio-label">Filter by Difficulty:</label>
            <div className="radio-options">
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="difficulty" 
                  value="all"
                  checked={filterDifficulty === 'all'}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                />
                <span>All</span>
              </label>
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="difficulty" 
                  value="EASY"
                  checked={filterDifficulty === 'EASY'}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                />
                <span>Easy</span>
              </label>
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="difficulty" 
                  value="MID"
                  checked={filterDifficulty === 'MID'}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                />
                <span>Medium</span>
              </label>
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="difficulty" 
                  value="HARD"
                  checked={filterDifficulty === 'HARD'}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                />
                <span>Hard</span>
              </label>
            </div>
          </div>

          <div className="challenges-grid">
            {filteredCtfs.length === 0 ? (
              <div className="no-challenges">
                <p>No challenges found with the selected filters</p>
              </div>
            ) : (
              filteredCtfs.map((ctf) => {
                const isSolved = solvedCtfIds.includes(ctf.id);
                return (
                  <ChallengeCard
                    key={ctf.id}
                    challenge={ctf}
                    onClick={() => setSelectedChallenge(ctf)}
                    isSolved={isSolved}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <ChallengeModal
          challenge={selectedChallenge}
          isOpen={!!selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onLaunchInstance={handleLaunchClick}
          onSubmitFlag={handleSubmitFlag}
          activeInstance={activeInstance && activeInstance.ctfId === selectedChallenge.id ? activeInstance : null}
          onStopInstance={handleStopInstance}
          isLoading={actionLoading}
          isSolved={solvedCtfIds.includes(selectedChallenge.id)}
        />
      )}

      {/* Launch Instance Modal */}
      {launchModalCtf && (
        <Modal
          isOpen={!!launchModalCtf}
          onClose={() => {
            setLaunchModalCtf(null);
            setInstanceUrl('');
          }}
          title="Launch Instance"
          instanceUrl={instanceUrl}
        >
          {!instanceUrl ? (
            <div>
              <p>Launch a new instance for <strong>{launchModalCtf?.name}</strong>?</p>
              <p style={{color: 'var(--error)', fontSize: '0.9rem', margin: '1rem 0'}}>
                This will create a new container. Existing instances will be unaffected.
              </p>
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                <button 
                  onClick={() => {
                    setLaunchModalCtf(null);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmLaunch}
                  disabled={actionLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: actionLoading ? '#ccc' : 'var(--primary)',
                    color: 'white',
                    cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading ? 'Launching...' : 'Launch Instance'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p>Instance launched successfully! <strong>Do not close this tab.</strong></p>
              <div style={{marginTop: '1rem'}}>
                <a 
                  href={instanceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--primary)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  Open Instance →
                </a>
              </div>
            </div>
          )}
        </Modal>
      )}

      {actionLoading && !launchModalCtf && !selectedChallenge && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="spinner"></div>
            <p>Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengePage;
