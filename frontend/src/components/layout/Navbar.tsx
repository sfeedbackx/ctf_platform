import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Ctf Platform
        </Link>

        <ul className="navbar-menu">
          {isAuthenticated ? (
            <>
              <li>
                <NavLink to="/challenges">Challenges</NavLink>
              </li>
              <li>
                <NavLink to="/scoreboard">Scoreboard</NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="btn-login">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn-register">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
