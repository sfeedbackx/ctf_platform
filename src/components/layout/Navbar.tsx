import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🚩 CTF Platform
        </Link>

        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/challenges">Challenges</Link></li>
          <li><Link to="/leaderboard">Leaderboard</Link></li>
          
          {isAuthenticated ? (
            <>
              <li><Link to="/profile">Profile</Link></li>
              {user?.role === 'admin' && (
                <li><Link to="/admin">Admin</Link></li>
              )}
              <li>
                <span className="user-score"> {user?.score} pts</span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn-login">Login</Link></li>
              <li><Link to="/register" className="btn-register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;