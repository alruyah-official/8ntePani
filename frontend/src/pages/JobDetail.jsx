import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import '../components/StarRating.css';
import './ServiceDetail.css';

/* ─────────────────────────── helpers ─────────────────────────── */
function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function relativeDate(iso) {
  if (!iso) return 'just now';
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
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/jobs/${jobId}`);
      setJob(res.data.data.job);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job posting.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

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

  const client = job.client;
  const profile = null;

  const isOwner = user?.id === job.clientId;
  const canInteract = !isOwner;


  const handleContact = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user.role === 'CLIENT') {
      alert('Only freelancers can apply to jobs.');
      return;
    }
    setContactLoading(true);
    try {
      const res = await api.post('/api/conversations', { 
        clientId: job.clientId 
      });
      navigate(`/messages/${res.data.data.conversation.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start conversation.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setStatusLoading(true);
    try {
      const res = await api.patch(`/api/jobs/${jobId}/status`, { 
        status: newStatus 
      });
      setJob(res.data.data.job);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="page-wrapper sd-upwork-page">
      <div className="container sd-upwork-container">
        
        {/* ── LEFT: Main Content ── */}
        <main className="sd-upwork-main">
          
          {/* Header Area */}
          <div className="sd-upwork-header">
            <div className="sd-upwork-breadcrumbs">
              <Link to="/jobs">Jobs</Link> / {job.category?.name || 'Development'} / {job.title}
            </div>

            <h1 className="sd-upwork-title">{job.title}</h1>
            
            <div className="sd-upwork-badges">
              <span className="badge-meta" style={{color: '#1a73e8', fontWeight: '600'}}>{job.category?.name || 'Development'}</span>
              <span className="badge-meta">• Posted {relativeDate(job.createdAt)}</span>
              <span className="badge-meta">
                • <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginRight: '2px', verticalAlign: 'middle'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> Worldwide
              </span>
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
            <h2 className="sd-upwork-heading" style={{fontSize: '1.1rem'}}>Job Description</h2>
            <div className="sd-upwork-description">
              {job.description.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Mock Attachments */}
            <div className="sd-attachment-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <div className="sd-attachment-info">
                <a href="#" onClick={e=>e.preventDefault()} className="sd-attachment-name">project-requirements.pdf</a>
                <span className="sd-attachment-size">1.2 MB</span>
              </div>
            </div>
          </section>

          <hr className="sd-upwork-divider" />

          {/* Skills and Expertise */}
          <section className="sd-upwork-section">
            <h2 className="sd-upwork-heading" style={{fontSize: '1.1rem'}}>Skills and Expertise</h2>
            <div className="sd-skills-list">
              {mockSkills.map(skill => (
                <span key={skill} className="sd-skill-pill">{skill}</span>
              ))}
            </div>
          </section>

          <hr className="sd-upwork-divider" />

          {/* Activity on this job */}
          <section className="sd-upwork-section">
            <h2 className="sd-upwork-heading" style={{fontSize: '1.1rem'}}>Activity on this job</h2>
            <div className="sd-activity-list">
              <div className="sd-activity-item">
                <span className="sd-activity-label">Proposals:</span>
                <span className="sd-activity-value">{mockActivity.proposals}</span>
              </div>
              <div className="sd-activity-item">
                <span className="sd-activity-label">Last viewed by client:</span>
                <span className="sd-activity-value">{mockActivity.lastViewed}</span>
              </div>
              <div className="sd-activity-item">
                <span className="sd-activity-label">Interviewing:</span>
                <span className="sd-activity-value">{mockActivity.interviewing}</span>
              </div>
              <div className="sd-activity-item">
                <span className="sd-activity-label">Invites sent:</span>
                <span className="sd-activity-value">{mockActivity.invitesSent}</span>
              </div>
              <div className="sd-activity-item">
                <span className="sd-activity-label">Unanswered invites:</span>
                <span className="sd-activity-value">{mockActivity.unansweredInvites}</span>
              </div>
            </div>
          </section>
        </main>

        {/* ── RIGHT: Sidebar ── */}
        <aside className="sd-upwork-sidebar">
          
          {/* CTA / Action Box */}
          <div className="sd-upwork-box cta-box">
            {!isAuthenticated ? (
              <div className="sd-auth-cta">
                <p style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                  Login as a freelancer to apply for this job
                </p>
                <Link to="/login" className="btn btn-primary btn-full upwork-cta-btn">
                  Log In to Apply
                </Link>
                <Link to="/register" className="btn btn-ghost btn-full mt-2">
                  Create Account
                </Link>
              </div>
            ) : isOwner ? (
              <div>
                <p style={{ color: '#64748b', marginBottom: '1rem', fontWeight: '600' }}>
                  You posted this job
                </p>
                {job.status === 'COMPLETED' ? (
                  <div style={{
                    background: '#d1fae5', padding: '1rem',
                    borderRadius: '8px', color: '#065f46',
                    textAlign: 'center', fontWeight: '600'
                  }}>
                    ✅ This job is completed
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
                      Update job status:
                    </p>
                    {statusLoading ? (
                      <p style={{ color: '#6b7280' }}>Updating...</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {job.status === 'OPEN' && (
                          <button
                            className="btn btn-full"
                            style={{ background: '#f59e0b', color: 'white', height: '48px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', border: 'none' }}
                            onClick={() => handleStatusUpdate('IN_PROGRESS')}
                          >
                            🟡 Mark as In Progress
                          </button>
                        )}
                        <button
                          className="btn btn-primary btn-full"
                          style={{ height: '48px' }}
                          onClick={() => handleStatusUpdate('COMPLETED')}
                        >
                          ✅ Mark as Completed
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : user.role === 'CLIENT' ? (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>
                <p>Only freelancers can apply for jobs.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Register as a freelancer to apply.
                </p>
              </div>
            ) : job.status !== 'OPEN' ? (
              <div style={{
                background: job.status === 'IN_PROGRESS' ? '#fef3c7' : '#f3f4f6',
                padding: '1rem', borderRadius: '8px',
                color: job.status === 'IN_PROGRESS' ? '#92400e' : '#6b7280',
                textAlign: 'center', fontWeight: '600'
              }}>
                {job.status === 'IN_PROGRESS' 
                  ? '🟡 This job is currently in progress'
                  : '⚫ This job has been completed'}
              </div>
            ) : (
              <>
                <button
                  className={`btn btn-primary btn-full btn-lg upwork-cta-btn${contactLoading ? ' btn-loading' : ''}`}
                  onClick={handleContact}
                  disabled={contactLoading}
                >
                  {contactLoading ? 'Opening chat...' : 'Apply Now'}
                </button>
                <p style={{ 
                  fontSize: '0.8rem', color: '#6b7280', 
                  textAlign: 'center', marginTop: '0.75rem' 
                }}>
                  Send a message to the client about this job
                </p>
              </>
            )}
          </div>

          {/* Client Profile Box */}
          <div className="sd-upwork-box freelancer-box">
            <h3 className="freelancer-box-title" style={{fontSize: '1.1rem'}}>
              About the Client
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              {job.client?.avatar ? (
                <img 
                  src={job.client.avatar} 
                  alt={job.client.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: '#4f46e5', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '600', fontSize: '1.1rem'
                }}>
                  {job.client?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p style={{ fontWeight: '600', color: '#1e293b' }}>{job.client?.name}</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Client</p>
              </div>
            </div>
            <div className="freelancer-meta-section">
              <span className="meta-label">Budget</span>
              <p style={{ fontSize: '14px', color: '#334155', fontWeight: '600' }}>
                {job.budget ? `₹${parseFloat(job.budget).toLocaleString()}` : 'Negotiable'}
              </p>
            </div>
            <div className="freelancer-meta-section">
              <span className="meta-label">Status</span>
              <p style={{ 
                fontSize: '14px', fontWeight: '600',
                color: job.status === 'OPEN' ? '#065f46' : 
                       job.status === 'IN_PROGRESS' ? '#92400e' : '#6b7280'
              }}>
                {job.status === 'OPEN' ? '🟢 Open' : 
                 job.status === 'IN_PROGRESS' ? '🟡 In Progress' : '⚫ Completed'}
              </p>
            </div>
            <div className="freelancer-meta-section" style={{ marginBottom: 0 }}>
              <span className="meta-label">Posted</span>
              <p style={{ fontSize: '14px', color: '#334155' }}>
                {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
        </aside>
      </div>
    </div>
  );
}
