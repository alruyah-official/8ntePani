import './Navbar.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import PostJobModal from './PostJobModal';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPostJobModal, setShowPostJobModal] = useState(false);

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    if (query.trim()) {
      navigate(`/explore?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand & Main Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <Link to="/" className="navbar-brand">
            <img src="/logo.png" alt="8ntePani Logo" className="navbar-logo" style={{ height: '140px', objectFit: 'contain', margin: '-50px 0 -50px -10px' }} />
          </Link>
          <Link to="/explore" style={{ fontWeight: '600', color: 'var(--color-text)', textDecoration: 'none' }}>Explore Services</Link>
          <Link to="/jobs" style={{ fontWeight: '600', color: 'var(--color-text)', textDecoration: 'none' }}>Find Jobs</Link>
        </div>

        {/* Center Search Bar */}
        <div className="navbar-search-wrapper">
          <form className="navbar-search" onSubmit={handleSearch}>
            <div className="navbar-search-3d-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input type="text" name="search" placeholder="What service are you looking for...!" className="navbar-search-input" />
          </form>
        </div>

        {/* Right side */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link to="/messages" className="navbar-icon-btn" title="Messages">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </Link>

              <Link to="/notifications" className="navbar-icon-btn" title="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </Link>

              <div className="navbar-user-menu">
                <button className="navbar-user-btn" aria-label="User menu">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="avatar avatar-sm" />
                  ) : (
                    <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.75rem' }}>
                      {initials}
                    </div>
                  )}
                  <span className="navbar-user-name">{user?.name}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <p className="navbar-dropdown-name">{user?.name}</p>
                    <p className="navbar-dropdown-role">{user?.role}</p>
                  </div>
                  <hr className="navbar-dropdown-divider" />
                  <Link to={user?.role === 'FREELANCER' ? "/dashboard" : "/client-dashboard"} className="navbar-dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="9"></rect>
                      <rect x="14" y="3" width="7" height="5"></rect>
                      <rect x="14" y="12" width="7" height="9"></rect>
                      <rect x="3" y="16" width="7" height="5"></rect>
                    </svg>
                    Dashboard
                  </Link>
                  {user?.role === 'CLIENT' && (
                    <button className="navbar-dropdown-item" onClick={() => setShowPostJobModal(true)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Post a Job
                    </button>
                  )}
                  <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
    {showPostJobModal && (
      <PostJobModal onClose={() => setShowPostJobModal(false)} />
    )}
    </>
  );
}

export default Navbar;
