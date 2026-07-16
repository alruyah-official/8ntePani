import './Auth.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'CLIENT' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/register', formData);
      if (res.data.success) {
        // Auto-login: backend only returns user on register, not token.
        // We need to log in separately.
        const loginRes = await api.post('/api/auth/login', {
          email: formData.email,
          password: formData.password,
        });
        const { user, token } = loginRes.data.data;
        login(user, token);
        navigate(user.role === 'FREELANCER' ? '/dashboard' : '/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-back-arrow" aria-label="Back to home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>
        {/* Logo */}
        <div className="auth-logo">
          <img src="/logo.png" alt="8ntePani Logo" className="auth-logo-img" style={{ height: '180px', objectFit: 'contain', margin: '-40px 0' }} />
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join thousands of freelancers and clients</p>
        </div>

        {error && (
          <div className="error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              minLength={2}
              maxLength={50}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">I want to...</label>
            <div className="auth-role-picker">
              <button
                type="button"
                id="role-client"
                className={`auth-role-option ${formData.role === 'CLIENT' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'CLIENT' }))}
              >
                <span className="auth-role-icon">🏢</span>
                <span className="auth-role-label">Hire Freelancers</span>
                <span className="auth-role-desc">I'm a Client</span>
              </button>
              <button
                type="button"
                id="role-freelancer"
                className={`auth-role-option ${formData.role === 'FREELANCER' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'FREELANCER' }))}
              >
                <span className="auth-role-icon">💼</span>
                <span className="auth-role-label">Offer Services</span>
                <span className="auth-role-desc">I'm a Freelancer</span>
              </button>
            </div>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
            style={{ marginTop: 'var(--space-2)' }}
            disabled={loading}
          >
            {loading ? '' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
