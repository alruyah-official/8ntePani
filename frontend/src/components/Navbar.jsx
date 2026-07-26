import '../styles/components/Navbar.css';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import PostJobModal from './PostJobModal';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPostJobModal, setShowPostJobModal] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/api/notifications/unread-count');
        setUnreadCount(res.data.data.count);
      } catch (err) {}
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notif-wrapper')) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data.data.notifications || []);
    } catch (err) {}
    finally { setNotifLoading(false); }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (err) {}
  };

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
          <NavLink to="/explore" className="nav-main-link">Explore Services</NavLink>
          <NavLink to="/jobs" className="nav-main-link">Find Jobs</NavLink>
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

              <div className="notif-wrapper" style={{ position: 'relative' }}>
                <button
                  className="navbar-icon-btn"
                  title="Notifications"
                  style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    setShowNotifDropdown(prev => !prev);
                    if (!showNotifDropdown) fetchNotifications();
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      background: '#ef4444', color: 'white',
                      borderRadius: '50%', width: '18px', height: '18px',
                      fontSize: '0.7rem', fontWeight: '700',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', lineHeight: 1
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div style={{
                    position: 'absolute', right: 0, top: '110%',
                    width: '360px', background: 'white',
                    borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    zIndex: 1000, overflow: 'hidden',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '1rem 1.25rem',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <h3 style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          style={{
                            background: 'none', border: 'none',
                            color: '#4f46e5', fontSize: '0.8rem',
                            cursor: 'pointer', fontWeight: '600'
                          }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                      {notifLoading ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                          Loading...
                        </p>
                      ) : notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                          <p style={{ fontSize: '1.5rem' }}>🔔</p>
                          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                            No notifications yet
                          </p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map(notif => (
                          <div
                            key={notif.id}
                            onClick={async () => {
                              if (!notif.isRead) {
                                try {
                                  await api.patch(`/api/notifications/${notif.id}/read`);
                                  setUnreadCount(prev => Math.max(0, prev - 1));
                                  setNotifications(prev =>
                                    prev.map(n => n.id === notif.id 
                                      ? { ...n, isRead: true } : n)
                                  );
                                } catch (err) {}
                              }
                              if (notif.relatedId) {
                                navigate(`/orders/${notif.relatedId}`);
                                setShowNotifDropdown(false);
                              }
                            }}
                            style={{
                              padding: '0.875rem 1.25rem',
                              borderBottom: '1px solid #f1f5f9',
                              cursor: 'pointer',
                              background: notif.isRead ? 'white' : '#f0f4ff',
                              transition: 'background 0.15s'
                            }}
                          >
                            <div style={{
                              display: 'flex', alignItems: 'flex-start',
                              gap: '0.75rem'
                            }}>
                              <span style={{ fontSize: '1.25rem', lineHeight: 1.2 }}>
                                {notif.type === 'NEW_ORDER' ? '📦' :
                                 notif.type === 'ORDER_ACCEPTED' ? '✅' :
                                 notif.type === 'ORDER_REJECTED' ? '❌' :
                                 notif.type === 'ORDER_DELIVERED' ? '🎁' :
                                 notif.type === 'ORDER_COMPLETED' ? '🏆' :
                                 notif.type === 'ORDER_CANCELLED' ? '🚫' :
                                 notif.type === 'NEW_MESSAGE' ? '💬' : '🔔'}
                              </span>
                              <div style={{ flex: 1 }}>
                                <p style={{
                                  fontWeight: notif.isRead ? '500' : '700',
                                  fontSize: '0.875rem', color: '#1e293b',
                                  marginBottom: '0.2rem'
                                }}>
                                  {notif.title}
                                </p>
                                <p style={{
                                  fontSize: '0.8rem', color: '#64748b',
                                  lineHeight: 1.4
                                }}>
                                  {notif.message}
                                </p>
                                <p style={{
                                  fontSize: '0.75rem', color: '#94a3b8',
                                  marginTop: '0.25rem'
                                }}>
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              {!notif.isRead && (
                                <div style={{
                                  width: '8px', height: '8px',
                                  borderRadius: '50%', background: '#4f46e5',
                                  flexShrink: 0, marginTop: '4px'
                                }} />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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
                  <Link to="/orders" className="navbar-dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                    My Orders
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
