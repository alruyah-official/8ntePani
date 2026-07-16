import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './ClientDashboard.css';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

const ClientDashboard = () => {
  const { user, login } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Avatar upload
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'CLIENT') return;

    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/profile/me');
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Protect route
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CLIENT') return <Navigate to="/" replace />;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    setAvatarError(null);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/api/profile/avatar', formData);
      if (res.data.success) {
        const updatedProfile = res.data.data;
        setProfile(updatedProfile);
        // Update context to sync navbar avatar
        login(updatedProfile, localStorage.getItem('token'));
      }
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="client-dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="client-dashboard-page">
      <div className="client-dashboard-header">
        <div className="client-dashboard-header-content">
          <h1 className="client-dashboard-title">My Account</h1>
          <p className="client-dashboard-subtitle">Manage your profile and settings</p>
        </div>
      </div>

      <div className="client-dashboard-container">
        {error && (
          <div className="error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <div className="client-dashboard-content">
          {/* Profile Card */}
          <div className="client-profile-card">
            <div className="client-avatar-section">
              <div 
                className={`client-avatar-wrapper ${uploadingAvatar ? 'uploading' : ''}`}
                onClick={handleAvatarClick}
                title="Click to change avatar"
              >
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="client-avatar-img" />
                ) : (
                  <div className="client-avatar-placeholder">
                    {getInitials(profile?.name)}
                  </div>
                )}
                
                <div className="client-avatar-overlay">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png, image/webp"
                  style={{ display: 'none' }} 
                />
              </div>
              
              <div className="client-info">
                <h2>{profile?.name}</h2>
                <span className="badge badge-primary client-role-badge">
                  {profile?.role}
                </span>
                <p className="client-email">{profile?.email}</p>
                <p className="client-joined">Member since {formatDate(profile?.createdAt)}</p>
              </div>
            </div>

            {avatarError && <div className="error-text mt-3">{avatarError}</div>}
          </div>

          {/* Quick Actions / Info */}
          <div className="client-actions-grid">
            <div className="client-action-card">
              <div className="client-action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>Messages</h3>
              <p>Continue your conversations with freelancers.</p>
              <Link to="/messages" className="btn btn-outline">Go to Inbox</Link>
            </div>

            <div className="client-action-card">
              <div className="client-action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3>Find Services</h3>
              <p>Explore the marketplace and hire top talent.</p>
              <Link to="/" className="btn btn-primary">Browse Services</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
