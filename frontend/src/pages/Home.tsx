import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
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
            <Link to={ROUTES.REGISTER} className="btn btn-primary btn-large">
              Get Started
            </Link>
          </div>
        )}
        {isAuthenticated && (
          <div className="hero-actions">
            <Link to={ROUTES.CHALLENGES} className="btn btn-primary btn-large">
              View Challenges
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
    </div>
  );
};

export default Home;
