import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => (location.pathname === path ? 'active' : '');

  // For demonstration, we'll use a static user avatar. Later, you can get initials from auth context.
  const userInitials = 'JS'; // e.g., John Smith

  return (
    <section className="navbar-section">
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">
            <i className="fa-solid fa-briefcase"></i>
          </div>
          <span>CCSConnect</span>
        </div>

        <ul className="nav-links">
          <li className={isActive('/')}>
            <Link to="/">
              <i className="fa-solid fa-house"></i> Home
            </Link>
          </li>
          <li className={isActive('/opportunities')}>
            <Link to="/opportunities">
              <i className="fa-solid fa-briefcase"></i> Opportunities
            </Link>
          </li>
          <li className={isActive('/dashboard')}>
            <Link to="/dashboard">
              <i className="fa-solid fa-chart-simple"></i> Dashboard
            </Link>
          </li>
          <li className={isActive('/notices')}>
            <Link to="/notices">
              <i className="fa-solid fa-bell"></i> Notices
            </Link>
          </li>
        </ul>

        <div className="nav-right">
          <NotificationDropdown />
          <div className="user-avatar">{userInitials}</div>
        </div>
      </nav>
    </section>
  );
};

export default Navbar;