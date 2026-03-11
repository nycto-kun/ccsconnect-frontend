import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <section className="navbar-section">
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon"><i className="fa-solid fa-briefcase"></i></div>
          <span>CCSConnect</span>
        </div>

        <ul className="nav-links">
          <li className={isActive('/')}>
            <Link to="/"><i className="fa-solid fa-house"></i> Home</Link>
          </li>
          {user ? (
            // Authenticated links
            <>
              <li className={isActive('/opportunities')}>
                <Link to="/opportunities"><i className="fa-solid fa-briefcase"></i> Opportunities</Link>
              </li>
              <li className={isActive('/dashboard')}>
                <Link to="/dashboard"><i className="fa-solid fa-chart-simple"></i> Dashboard</Link>
              </li>
              <li className={isActive('/notices')}>
                <Link to="/notices"><i className="fa-solid fa-bell"></i> Notices</Link>
              </li>
            </>
          ) : (
            // Public links
            <>
              <li className={isActive('/login')}>
                <Link to="/login"><i className="fa-solid fa-right-to-bracket"></i> Login</Link>
              </li>
              <li className={isActive('/register')}>
                <Link to="/register"><i className="fa-solid fa-user-plus"></i> Register</Link>
              </li>
            </>
          )}
        </ul>

        <div className="nav-right">
          {user && <NotificationDropdown />}
          <div className="user-avatar">
            {user ? user.full_name?.charAt(0) : 'G'}
          </div>
          {user && (
            <button className="logout-btn" onClick={logout} style={{ marginLeft: '10px' }}>
              Logout
            </button>
          )}
        </div>
      </nav>
    </section>
  );
};

export default Navbar;