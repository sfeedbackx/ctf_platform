// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { submissionService, type Submission } from '../services/submissionService';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await submissionService.getMySubmissions();
        setSubmissions(data);
      } catch (error: any) {
        // Ignore 401 to avoid forcing logout
        if (error.response?.status !== 401) {
          console.error('Failed to fetch submissions:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSubmissions();
    } else {
      setLoading(false);
    }
  }, [user]);

  // ✅ Show auth loading
  if (authLoading) {
    return (
      <div className="profile-page">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  // ✅ Show login prompt if no user
  if (!user) {
    return (
      <div className="profile-page">
        <div className="p-8 text-center text-white">
          <h1 className="text-2xl mb-4">Profile</h1>
          <p>
            No user data found.{' '}
            <a href="/login" className="text-blue-400 hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ✅ Safe values
  const username = user.username ?? 'User';
  const avatarLetter = username.charAt(0).toUpperCase();
  const email = user.email ?? 'N/A';
  const score = user.score ?? 0;
  const correctSubmissions = submissions.filter(s => s.correct).length;
  const totalSubmissions = submissions.length;
  const successRate = totalSubmissions > 0
    ? Math.round((correctSubmissions / totalSubmissions) * 100)
    : 0;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{avatarLetter}</div>
        <div className="profile-info">
          <h1>{username}</h1>
          <p>{email}</p>
          {user.teamName && <p className="team-name">Team: {user.teamName}</p>}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-box">
          <div className="stat-value">⭐ {score}</div>
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
          <p className="text-gray-400">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-gray-400">No submissions yet. Start solving challenges!</p>
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
                <tr key={submission._id}>
                  <td>{submission.ctfId?.slice(-6) || 'Challenge'}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        submission.correct ? 'correct' : 'incorrect'
                      }`}
                    >
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
