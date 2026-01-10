import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <h1>🚩 Welcome to CTF Platform</h1>
        <p className="hero-subtitle">
          Test your hacking skills with challenging cybersecurity puzzles
        </p>
        {!isAuthenticated && (
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started
            </Link>
            <Link to="/challenges" className="btn btn-secondary btn-large">
              Browse Challenges
            </Link>
          </div>
        )}
        {isAuthenticated && (
          <div className="hero-actions">
            <Link to="/challenges" className="btn btn-primary btn-large">
              View Challenges
            </Link>
            <Link to="/leaderboard" className="btn btn-secondary btn-large">
              Leaderboard
            </Link>
          </div>
        )}
      </section>

      <section className="features">
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Web Exploitation</h3>
            <p>SQL injection, XSS, CSRF and more</p>
          </div>
          <div className="feature-card">
            <h3>Cryptography</h3>
            <p>Crack codes and break encryption</p>
          </div>
          <div className="feature-card">
            <h3>Reverse Engineering</h3>
            <p>Analyze binaries and find vulnerabilities</p>
          </div>
          <div className="feature-card">
            <h3>Forensics</h3>
            <p>Investigate and find hidden data</p>
          </div>
        </div>
      </section>

      <section className="stats">
        <h2>Platform Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">50+</div>
            <div className="stat-label">Challenges</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Players</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">5000+</div>
            <div className="stat-label">Submissions</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;