import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';
import { useToast } from '../../hooks/useToast';
import { ROUTES } from '../../utils/constants';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate(ROUTES.LOGIN);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={ROUTES.HOME} className="navbar-logo">
          Ctf Platform
        </Link>

        <ul className="navbar-menu">
          {isAuthenticated ? (
            <>
              <li>
                <NavLink to={ROUTES.CHALLENGES}>Challenges</NavLink>
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
                <Link to={ROUTES.LOGIN} className="btn-login">
                  Login
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER} className="btn-register">
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
