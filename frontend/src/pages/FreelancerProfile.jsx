import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ServiceCard from '../components/ServiceCard';
import './FreelancerProfile.css';

/* ─────────────────────────── helpers ─────────────────────────── */
function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatMemberSince(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/* ─────────────────────────── Avatar ─────────────────────────── */
function Avatar({ src, name, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        className={`avatar avatar-${size} ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={`avatar avatar-${size} avatar-placeholder ${className}`}>
      {getInitials(name)}
    </div>
  );
}

/* ────────────────────────── Main Page ───────────────────────── */
export default function FreelancerProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/profile/${userId}`);
      setProfile(res.data.data.profile);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleContact = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setContactLoading(true);
    setContactError('');
    try {
      const res = await api.post('/api/conversations', { freelancerId: profile.userId });
      navigate(`/messages/${res.data.data.conversation.id}`);
    } catch (err) {
      setContactError(err.response?.data?.message || 'Failed to start conversation.');
    } finally {
      setContactLoading(false);
    }
  };

  /* ── states ── */
  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fp-error-state">
        <div className="error-banner">{error}</div>
        <button className="btn btn-primary" onClick={fetchProfile}>Retry</button>
      </div>
    );
  }

  if (!profile) return null;

  const freelancerUser = profile.user;
  const services = freelancerUser?.services || [];
  const isClient = user?.role === 'CLIENT';
  const isSelf = user?.id === profile.userId;

  return (
    <div className="fp-page">
      {/* ── Hero Banner ── */}
      <div className="fp-hero-banner" aria-hidden="true" />

      <div className="page-wrapper">
        <div className="container fp-container">

          {/* ── Profile Header ── */}
          <div className="fp-header-card">
            <div className="fp-header-body">
              <div className="fp-avatar-wrap">
                <Avatar
                  src={freelancerUser?.avatar}
                  name={freelancerUser?.name || 'Freelancer'}
                  size="xl"
                  className="fp-avatar"
                />
              </div>

              <div className="fp-header-info">
                <div className="fp-header-top-row">
                  <h1 className="fp-name">{freelancerUser?.name}</h1>
                  <span className="badge badge-primary fp-role-badge">Freelancer</span>
                </div>
                <p className="fp-email">{freelancerUser?.email}</p>

                <div className="fp-header-meta">
                  {profile.location && (
                    <span className="fp-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {profile.location}
                    </span>
                  )}
                  {freelancerUser?.createdAt && (
                    <span className="fp-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Member since {formatMemberSince(freelancerUser.createdAt)}
                    </span>
                  )}
                  <span className="fp-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    {services.length} service{services.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Contact Button */}
              {isClient && !isSelf && (
                <div className="fp-header-actions">
                  {contactError && <p className="fp-contact-error">{contactError}</p>}
                  <button
                    className={`btn btn-primary btn-lg${contactLoading ? ' btn-loading' : ''}`}
                    onClick={handleContact}
                    disabled={contactLoading}
                    id="contact-freelancer-profile-btn"
                  >
                    {contactLoading ? '' : 'Contact'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Body Grid ── */}
          <div className="fp-body-grid">

            {/* ── LEFT: Sidebar ── */}
            <aside className="fp-sidebar">

              {/* Bio */}
              {profile.bio && (
                <div className="fp-sidebar-card">
                  <div className="fp-sidebar-card-body">
                    <h2 className="fp-sidebar-heading">About</h2>
                    <p className="fp-bio-text">{profile.bio}</p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {profile.skills?.length > 0 && (
                <div className="fp-sidebar-card">
                  <div className="fp-sidebar-card-body">
                    <h2 className="fp-sidebar-heading">Skills</h2>
                    <div className="tag-list fp-skills-list">
                      {profile.skills.map((skill) => (
                        <span key={skill} className="tag fp-skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.languages?.length > 0 && (
                <div className="fp-sidebar-card">
                  <div className="fp-sidebar-card-body">
                    <h2 className="fp-sidebar-heading">Languages</h2>
                    <div className="fp-lang-list">
                      {profile.languages.map((lang) => (
                        <div key={lang} className="fp-lang-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                          {lang}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </aside>

            {/* ── RIGHT: Services ── */}
            <section className="fp-services-section">
              <div className="fp-services-header">
                <h2 className="fp-services-title">Services</h2>
                {services.length > 0 && (
                  <span className="badge badge-neutral">{services.length}</span>
                )}
              </div>

              {services.length === 0 ? (
                <div className="empty-state fp-empty-services">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                  <p>No services listed yet.</p>
                </div>
              ) : (
                <div className="fp-services-grid">
                  {services.map((svc) => (
                    <ServiceCard key={svc.id} service={svc} />
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
