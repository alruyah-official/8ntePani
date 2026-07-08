import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const navStyle = {
    background: '#1a1a2e',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
  };

  const linkStyle = { color: 'white', textDecoration: 'none', marginRight: '1rem' };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={linkStyle}><strong>8ntePani</strong></Link>
        <Link to="/" style={linkStyle}>Services</Link>
      </div>
      <div>
        {!isAuthenticated ? (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        ) : (
          <>
            <span style={{ marginRight: '1rem' }}>Hello, {user?.name}</span>
            {user?.role === 'FREELANCER' && (
              <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
            )}
            <Link to="/messages" style={linkStyle}>Messages</Link>
            <button 
              onClick={logout} 
              style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '0.25rem 0.5rem', cursor: 'pointer', borderRadius: '4px' }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
