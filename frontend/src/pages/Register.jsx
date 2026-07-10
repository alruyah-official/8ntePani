import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Register button clicked");
    setLoading(true);
    setError(null);

    try {
      console.log("Sending request...");
      const res = await api.post('/api/auth/register', formData);
      console.log("Response:", res);
      if (res.data.success) {
        const { user, token } = res.data.data;
        login(user, token);
        navigate('/');
      }
    } catch (err) {
      console.log("Error:", err);
      console.log("Response:", err.response);
      console.log("Message:", err.message);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
  };

  const errorStyle = {
    background: '#fee2e2',
    border: '1px solid #ef4444',
    color: '#991b1b',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  };

  return (
    <div style={pageStyle}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Join 8ntePani</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>Create your account</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange}>
              <option value="CLIENT">I want to hire freelancers (Client)</option>
              <option value="FREELANCER">I want to work (Freelancer)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
            
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#4f46e5' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
