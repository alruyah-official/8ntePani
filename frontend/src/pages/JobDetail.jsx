import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import '../components/StarRating.css';
import './ServiceDetail.css'; // Reusing the exact same Upwork style CSS

/* ─────────────────────────── helpers ─────────────────────────── */
function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function relativeDate(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function Avatar({ src, name, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        className={`avatar avatar-${size}`}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={`avatar avatar-${size} avatar-placeholder`}>
      {getInitials(name)}
    </div>
  );
}

/* ───────────────────────── Main Page ────────────────────────── */
export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Mocking: Fetching from services for now since there's no jobs endpoint
      const res = await api.get(`/api/services/${jobId}`);
      setJob(res.data.data.service);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job posting.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  const handleContact = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setContactLoading(true);
    try {
      // Create conversation with the person who posted this
      const res = await api.post('/api/conversations', { freelancerId: job.freelancerId });
      navigate(`/messages/${res.data.data.conversation.id}`);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      setContactLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading job details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-error-state">
        <div className="error-banner">{error}</div>
        <button className="btn btn-primary" onClick={fetchJob}>Retry</button>
      </div>
    );
  }

  if (!job) return null;

  // Mocking client with freelancer data for UI purposes
  const client = job.freelancer;
  const profile = client?.clientProfile || client?.freelancerProfile; 

  const isOwner = user?.id === job.freelancerId;
  const canInteract = !isOwner;

  return (
    <div className="page-wrapper sd-upwork-page">
      <div className="container sd-upwork-container">
        
        {/* ── LEFT: Main Content ── */}
        <main className="sd-upwork-main">
          
          {/* Header Area */}
          <div className="sd-upwork-header">
            <h1 className="sd-upwork-title">{job.title}</h1>
            
            <div className="sd-upwork-badges">
              <span className="badge-new">New Job</span>
              <span className="badge-meta">Fixed-price • Posted recently</span>
              {job.category?.name && (
                <span className="badge-meta">• {job.category.name}</span>
              )}
            </div>
            
            <div className="sd-upwork-details-grid">
              <div className="upwork-detail-block">
                <svg className="upwork-detail-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <div className="upwork-detail-text">
                  <span className="upwork-detail-value">${parseFloat(job.price).toLocaleString()}</span>
                  <span className="upwork-detail-label">Fixed-price</span>
                </div>
              </div>
              
              <div className="upwork-detail-block">
                <svg className="upwork-detail-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <div className="upwork-detail-text">
                  <span className="upwork-detail-value">Intermediate</span>
                  <span className="upwork-detail-label">Experience level</span>
                </div>
              </div>

              <div className="upwork-detail-block">
                <svg className="upwork-detail-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <div className="upwork-detail-text">
                  <span className="upwork-detail-value">Less than {job.deliveryDays} Days</span>
                  <span className="upwork-detail-label">Project Length</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="sd-upwork-divider" />

          {/* Description */}
          <section className="sd-upwork-section">
            <h2 className="sd-upwork-heading">Job Description</h2>
            <div className="sd-upwork-description">
              {job.description.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </section>

          <hr className="sd-upwork-divider" />
        </main>

        {/* ── RIGHT: Sidebar ── */}
        <aside className="sd-upwork-sidebar">
          
          {/* CTA / Action Box */}
          <div className="sd-upwork-box cta-box">
            {isAuthenticated ? (
              canInteract ? (
                <>
                  <button
                    className={`btn btn-primary btn-full btn-lg upwork-cta-btn${contactLoading ? ' btn-loading' : ''}`}
                    onClick={handleContact}
                    disabled={contactLoading}
                  >
                    {contactLoading ? '' : 'Submit Proposal'}
                  </button>
                  <p className="upwork-cta-hint">Send a message to the client to apply.</p>
                </>
              ) : (
                <div className="sd-owner-notice">You posted this job.</div>
              )
            ) : (
              <div className="sd-auth-cta">
                <Link to="/login" className="btn btn-primary btn-full upwork-cta-btn">Log In to Apply</Link>
                <Link to="/register" className="btn btn-ghost btn-full mt-2">Create Account</Link>
              </div>
            )}
          </div>

          {/* Client Profile Box */}
          <div className="sd-upwork-box freelancer-box">
            <h3 className="freelancer-box-title">About the Client</h3>
            
            <div className="freelancer-box-identity">
              <Avatar src={client?.avatar} name={client?.name || 'Client'} size="lg" />
              <div className="freelancer-box-info">
                <Link to={`/profile/${client?.id}`} className="freelancer-name">
                  {client?.name}
                </Link>
                {profile?.location && (
                  <span className="freelancer-location">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {profile.location}
                  </span>
                )}
                
                <div className="freelancer-rating-sm">
                  <StarRating rating={5.0} size={12} interactive={false} />
                  <span>5.0</span>
                </div>
              </div>
            </div>

            <div className="freelancer-meta-section">
              <span className="meta-label">Client History</span>
              <p style={{fontSize: '13px', color: '#475569'}}>14 jobs posted<br/>85% hire rate, 1 open job<br/>$12k+ total spent</p>
            </div>
            
            <hr className="freelancer-box-divider" />
            <Link to={`/profile/${client?.id}`} className="btn btn-secondary btn-full">
              View Client Profile
            </Link>
          </div>
          
        </aside>
      </div>
    </div>
  );
}
