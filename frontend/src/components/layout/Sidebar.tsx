import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const categories = [
    { name: 'All',  path: '/challenges' },
    { name: 'Web',  path: '/challenges?category=web' },
    { name: 'Crypto', path: '/challenges?category=crypto' },
    { name: 'Reverse', path: '/challenges?category=reverse' },
    { name: 'Forensics', path: '/challenges?category=forensics' },
    { name: 'Pwn', icon: '', path: '/challenges?category=pwn' },
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
                className={location.search.includes(cat.name.toLowerCase()) ? 'active' : ''}
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
          <li><Link to="/challenges?difficulty=easy">🟢 Easy</Link></li>
          <li><Link to="/challenges?difficulty=medium">🟡 Medium</Link></li>
          <li><Link to="/challenges?difficulty=hard">🔴 Hard</Link></li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;