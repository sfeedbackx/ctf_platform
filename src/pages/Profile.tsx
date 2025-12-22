import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { submissionService,type Submission} from '../services/submissionService';
import './Profile.css';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await submissionService.getMySubmissions();
        setSubmissions(data);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (!user) return null;

  const correctSubmissions = submissions.filter(s => s.correct).length;
  const totalSubmissions = submissions.length;
  const successRate = totalSubmissions > 0 
    ? Math.round((correctSubmissions / totalSubmissions) * 100) 
    : 0;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p>{user.email}</p>
          {user.teamName && <p className="team-name">Team: {user.teamName}</p>}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-box">
          <div className="stat-value">⭐ {user.score}</div>
          <div className="stat-label">Total Score</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{correctSubmissions}</div>
          <div className="stat-label">Challenges Solved</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{successRate}%</div>
          <div className="stat-label">Success Rate</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{totalSubmissions}</div>
          <div className="stat-label">Total Attempts</div>
        </div>
      </div>

      <div className="profile-submissions">
        <h2>Recent Submissions</h2>
        {loading ? (
          <p>Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p>No submissions yet. Start solving challenges!</p>
        ) : (
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Challenge</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {submissions.slice(0, 10).map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.challengeId}</td>
                  <td>
                    <span className={`status-badge ${submission.correct ? 'correct' : 'incorrect'}`}>
                      {submission.correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </td>
                  <td>{new Date(submission.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Profile;