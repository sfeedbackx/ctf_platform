import React, { useState, useEffect } from 'react';
import { challengeService } from '../../services/challengeService';
import type { Ctf, CtfDifficulty, CtfType } from '../../types/ctf';
import ChallengeCard from './ChallengeCard';
import ChallengeModal from './ChallengeModal';
import './ChallengeList.css';

const ChallengeList: React.FC = () => {
  const [challenges, setChallenges] = useState<Ctf[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Ctf | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const data = await challengeService.getAllChallenges(
          category,
          difficulty,
        );

        // Map API data to Ctf type
        const mappedData: Ctf[] = data.map((challenge: any, index: number) => ({
          id: challenge.id || `challenge-${index}`,
          name: challenge.name || challenge.title || `Challenge ${index}`,
          type: (challenge.type as CtfType) || 'OTHER',
          description: challenge.description || '',
          difficulty: (challenge.difficulty as CtfDifficulty) || 'MID',
          hints: challenge.hints || [],
          resources: challenge.resources || [],
          withSite: challenge.withSite ?? false,
          solved: challenge.solved ?? false,
        }));

        setChallenges(mappedData);
      } catch (error) {
        console.error('Failed to fetch challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [category, difficulty]);

  const handleChallengeClick = (challenge: Ctf) => {
    setSelectedChallenge(challenge);
  };

  const handleCloseModal = () => {
    setSelectedChallenge(null);
  };

  if (loading) {
    return <div className="loading">Loading challenges...</div>;
  }

  return (
    <div className="challenge-list">
      {/* Filters */}
      <div className="challenge-filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="WEB_EXPLOIT">Web</option>
          <option value="FORENSICS">Forensics</option>
          <option value="OTHER">Other</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MID">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Challenges Grid */}
      <div className="challenge-grid">
        {challenges.length === 0 ? (
          <p className="no-challenges">No challenges found</p>
        ) : (
          challenges.map((challenge) => (
            <ChallengeCard 
              key={challenge.id} 
              challenge={challenge}
              onClick={() => handleChallengeClick(challenge)}
              isSolved={challenge.solved}
            />
          ))
        )}
      </div>

      {/* Challenge Modal */}
      {selectedChallenge && (
        <ChallengeModal
          challenge={selectedChallenge}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ChallengeList;
