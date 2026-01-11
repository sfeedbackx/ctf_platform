import React, { useState } from 'react';
import { useCtf } from '../hooks/useCtf';
import { useAuth } from '../context/AuthContext';
import ChallengeCard from '../components/challenges/ChallengeCard';
import { ActiveInstanceBanner } from '../components/ActiveInstanceBanner';
import { FlagSubmitModal } from '../components/FlagSubmitModal';
import './Challenges.css';

const ChallengePage: React.FC = () => {
  const { user } = useAuth();
  const { 
    ctfs, 
    activeInstance, 
    loading, 
    error, 
    startInstance, 
    stopInstance, 
    submitFlag 
  } = useCtf();
  
  const [flagModalCtf, setFlagModalCtf] = useState<{ id: string; name: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Handle starting a CTF instance
  const handleStartInstance = async (ctfId: string) => {
  try {
    setActionLoading(true);

    const instance = await startInstance(ctfId);

    // ✅ Redirect user to the challenge instance
    if (instance.url) {
      window.location.href = instance.url;
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to start instance';
    alert(` Error: ${errorMessage}`);
  } finally {
    setActionLoading(false);
  }
};

  // Handle stopping the active instance
  const handleStopInstance = async () => {
    if (!activeInstance) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to stop this instance?\n\nYou will need to restart it to continue the challenge.'
    );
    
    if (!confirmed) return;
    
    try {
      setActionLoading(true);
      await stopInstance(activeInstance.id);
      alert('✓ Instance stopped successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop instance';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle flag submission
  const handleSubmitFlag = async (flag: string) => {
    if (!flagModalCtf) return;
    
    try {
      setActionLoading(true);
      const result = await submitFlag(flagModalCtf.id, flag);
      
      // Show success message
      alert(`🎉 ${result.message}`);
      
      // Close modal
      setFlagModalCtf(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wrong flag';
      alert(`❌ ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Get solved CTF IDs from user (you'll need to add this to your User type)
  const solvedCtfIds: string[] = []; // TODO: Get from user.solvedCtfs when available

  // Filter challenges
  const filteredCtfs = ctfs.filter(ctf => {
    const categoryMatch = filterCategory === 'all' || ctf.type === filterCategory;
    const difficultyMatch = filterDifficulty === 'all' || ctf.difficulty === filterDifficulty;
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
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="challenges-page">
      <div className="page-header">
        <h1>CTF Challenges</h1>
        <p>Test your skills across various cybersecurity challenges</p>
      </div>

      {/* Active Instance Banner */}
      {activeInstance && (
        <ActiveInstanceBanner 
          instance={activeInstance} 
          onStop={handleStopInstance} 
        />
      )}

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="WEB_EXPLOIT">Web Exploit</option>
            <option value="BE">Backend</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Difficulty:</label>
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
      </div>

      {/* Challenge Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-value">{ctfs.length}</span>
          <span className="stat-label">Total Challenges</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{solvedCtfIds.length}</span>
          <span className="stat-label">Solved</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{activeInstance ? '1' : '0'}</span>
          <span className="stat-label">Active Instance</span>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="challenges-grid">
        {filteredCtfs.length === 0 ? (
          <div className="no-challenges">
            <p>No challenges found with the selected filters</p>
          </div>
        ) : (
          filteredCtfs.map((ctf) => (
            <ChallengeCard
              key={ctf.id}
              challenge={ctf}
              onStart={handleStartInstance}
              onSubmitFlag={(ctfId) => setFlagModalCtf({ id: ctfId, name: ctf.name })}
              hasActiveInstance={!!activeInstance && activeInstance.ctfId !== ctf.id}
            />
          ))
        )}
      </div>

      {/* Flag Submission Modal */}
      {flagModalCtf && (
        <FlagSubmitModal
          ctfName={flagModalCtf.name}
          onSubmit={handleSubmitFlag}
          onClose={() => setFlagModalCtf(null)}
        />
      )}

      {/* Loading Overlay */}
      {actionLoading && (
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