import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Dashboard.css'; // Reusing the premium Dashboard styles!

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
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

/* ─── Client Overview Tab ─────────────────────────────────────────────────── */
function ClientOverviewTab() {
  return (
    <div className="animate-fade-in">
      <div className="tab-header">
        <h2 className="tab-title">Client Overview</h2>
        <p className="tab-subtitle">Here's a summary of your hiring and project activity.</p>
      </div>

      <div className="analytics-grid">
        <div className="stat-card green">
          <span className="stat-title">Active Conversations</span>
          <span className="stat-value">2</span>
          <div className="stat-change positive">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            Requires your reply
          </div>
        </div>
        <div className="stat-card purple">
          <span className="stat-title">Services Purchased</span>
          <span className="stat-value">4</span>
          <div className="stat-change neutral">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            All completed successfully
          </div>
        </div>
        <div className="stat-card orange">
          <span className="stat-title">Total Spent</span>
          <span className="stat-value">$1,250</span>
          <div className="stat-change neutral">
            Lifetime spending
          </div>
        </div>
      </div>

      <div className="activity-section">
        <h3 className="activity-title">Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div className="activity-content">
              <p className="activity-text">You sent a message to <b>Shamil</b> regarding "React Development".</p>
              <p className="activity-time">5 hours ago</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
            </div>
            <div className="activity-content">
              <p className="activity-text">Service <b>"Logo Design"</b> was completed and delivered.</p>
              <p className="activity-time">2 days ago</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div className="activity-content">
              <p className="activity-text">You left a 5-star review for <b>Unknown Freelancer</b>.</p>
              <p className="activity-time">1 week ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Client Settings Tab ─────────────────────────────────────────────────── */
function ClientSettingsTab({ profile, uploadingAvatar, avatarError, fileInputRef, handleAvatarClick, handleFileChange }) {
  return (
    <div className="animate-fade-in">
      <div className="tab-header">
        <h2 className="tab-title">Account Settings</h2>
        <p className="tab-subtitle">Manage your personal information and avatar.</p>
      </div>

      {avatarError && (
        <div className="error-banner" style={{ marginBottom: 'var(--space-6)' }}>
          <span>⚠</span> {avatarError}
        </div>
      )}

      <div className="profile-cards-container">
        {/* Basic Info Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Basic Information</h3>
            <p className="profile-card-subtitle">Your avatar and email</p>
          </div>
          
          <div className="avatar-edit-section">
            <div
              className={`avatar-upload-trigger ${uploadingAvatar ? 'uploading' : ''}`}
              onClick={handleAvatarClick}
            >
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="profile-edit-avatar" />
              ) : (
                <div className="profile-edit-avatar sidebar-avatar-placeholder" style={{ width: '100%', height: '100%' }}>
                  {getInitials(profile?.name)}
                </div>
              )}
              <div className="avatar-overlay">
                {uploadingAvatar ? (
                  <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
            <div className="avatar-edit-info">
              <h4>Profile Picture</h4>
              <p>JPG, PNG or WEBP. Max size of 5MB.</p>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={profile?.name || ''} disabled />
            <p className="form-hint">Name changes are currently disabled.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="text" className="form-input" value={profile?.email || ''} disabled />
          </div>
          
          <div className="form-group">
            <label className="form-label">Member Since</label>
            <input type="text" className="form-input" value={formatDate(profile?.createdAt)} disabled />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Client Dashboard Main ─────────────────────────────────────────────── */
const ClientDashboard = () => {
  const { user, login } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Avatar upload
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'CLIENT') return;

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

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CLIENT') return <Navigate to="/" replace />;

  const handleAvatarClick = () => {
    if (!uploadingAvatar) fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
        const updatedProfile = res.data.data.user; // Ensure correct nested path based on backend payload, typically user holds avatar
        // Merge the updated avatar into current profile state
        setProfile(prev => ({ ...prev, avatar: updatedProfile.avatar }));
        
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
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading dashboard…</p>
      </div>
    );
  }

  const initials = getInitials(profile?.name || user?.name);
  const avatarSrc = profile?.avatar || user?.avatar;

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar Navigation ── */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-user-block">
          {avatarSrc ? (
            <img src={avatarSrc} alt={profile?.name} className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar-placeholder">{initials}</div>
          )}
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{profile?.name || user.name}</span>
            <span className="sidebar-user-role">{profile?.role || user.role}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Overview
          </button>
          
          <button 
            className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Account Settings
          </button>

          <Link to="/messages" className="sidebar-link" style={{ marginTop: 'var(--space-4)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Messages
          </Link>
          
          <Link to="/explore" className="sidebar-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Explore Services
          </Link>
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="dashboard-main">
        {error && (
          <div className="error-banner" style={{ marginBottom: 'var(--space-6)' }}>
            <span>⚠</span> {error}
          </div>
        )}

        {activeTab === 'overview' && <ClientOverviewTab />}
        {activeTab === 'settings' && (
          <ClientSettingsTab 
            profile={profile}
            uploadingAvatar={uploadingAvatar}
            avatarError={avatarError}
            fileInputRef={fileInputRef}
            handleAvatarClick={handleAvatarClick}
            handleFileChange={handleFileChange}
          />
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
