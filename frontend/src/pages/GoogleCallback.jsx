import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/pages/Auth.css';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (!token || !userParam) {
      setError('Google authentication failed. Missing authentication token.');
      setTimeout(() => navigate('/login'), 2500);
      return;
    }

    try {
      const decodedUserString = atob(userParam);
      const user = JSON.parse(decodedUserString);

      login(user, token);

      // Redirect user based on role
      setTimeout(() => {
        navigate(user.role === 'FREELANCER' ? '/dashboard' : '/');
      }, 500);
    } catch (err) {
      console.error('Failed to parse Google OAuth callback parameters:', err);
      setError('Authentication failed. Invalid user session.');
      setTimeout(() => navigate('/login'), 2500);
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">
          <img src="/logo.png" alt="8ntePani Logo" className="auth-logo-img" style={{ height: '180px', objectFit: 'contain', margin: '-40px 0' }} />
        </div>

        {error ? (
          <div className="error-banner" style={{ marginTop: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        ) : (
          <div style={{ padding: '2rem 0' }}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid #e0e7ff',
              borderTopColor: '#4f46e5', borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem'
            }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
              Signing you in with Google...
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Please wait while we complete your authentication.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
