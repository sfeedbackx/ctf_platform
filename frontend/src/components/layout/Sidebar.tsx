import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const categories = [
    { name: 'All', path: ROUTES.CHALLENGES },
    { name: 'Web', path: `${ROUTES.CHALLENGES}?category=web` },
    { name: 'Crypto', path: `${ROUTES.CHALLENGES}?category=crypto` },
    { name: 'Reverse', path: `${ROUTES.CHALLENGES}?category=reverse` },
    { name: 'Forensics', path: `${ROUTES.CHALLENGES}?category=forensics` },
    { name: 'Pwn', icon: '', path: `${ROUTES.CHALLENGES}?category=pwn` },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Categories</h3>
        <ul className="sidebar-list">
          {categories.map((cat) => (
            <li key={cat.name}>
              <Link
                to={cat.path}
                className={
                  location.search.includes(cat.name.toLowerCase())
                    ? 'active'
                    : ''
                }
              >
                <span className="sidebar-icon">{cat.icon}</span>
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <h3>Difficulty</h3>
        <ul className="sidebar-list">
          <li>
            <Link to={`${ROUTES.CHALLENGES}?difficulty=easy`}>🟢 Easy</Link>
          </li>
          <li>
            <Link to={`${ROUTES.CHALLENGES}?difficulty=medium`}>🟡 Medium</Link>
          </li>
          <li>
            <Link to={`${ROUTES.CHALLENGES}?difficulty=hard`}>🔴 Hard</Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
