import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './JobDetail.css';

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
        style={{ objectFit: 'cover' }}
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

/* ───────────────────────── Mock Data ────────────────────────── */
// Kept per user request to allow backend connection later
const mockSkills = ['React', 'Node.js', 'UI/UX Design', 'Figma', 'TypeScript', 'Tailwind CSS'];
const mockActivity = {
  proposals: '10 to 15',
  lastViewed: '2 hours ago',
  interviewing: '2',
  invitesSent: '0',
  unansweredInvites: '0'
};

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
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div className="error-banner" style={{ display: 'inline-block', marginBottom: '1rem' }}>{error}</div>
        <br />
        <button className="btn btn-primary" onClick={fetchJob}>Retry</button>
      </div>
    );
  }

  if (!job) return null;

  const isOwner = user?.id === job.clientId;

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
    <div className="job-detail-page">
      <div className="container">
        
        <div className="job-detail-layout">
          {/* ── LEFT: Main Content ── */}
          <main className="job-detail-main">
            
            {/* Header Area */}
            <div className="job-detail-header">
              <div className="job-breadcrumbs">
                <Link to="/jobs">Jobs Board</Link> / {job.category?.name || 'Category'}
              </div>

              <h1 className="job-title">{job.title}</h1>
              
              <div className="job-meta-badges">
                <span className="job-meta-badge highlight">{job.category?.name || 'Development'}</span>
                <span className="job-meta-badge">Posted {relativeDate(job.createdAt)}</span>
                <span className="job-meta-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> 
                  Worldwide
                </span>
              </div>
              
              <div className="job-highlights-grid">
                <div className="job-highlight-item">
                  <svg className="job-highlight-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <span className="job-highlight-value">
                    {job.budget ? `₹${parseFloat(job.budget).toLocaleString()}` : 'Negotiable'}
                  </span>
                  <span className="job-highlight-label">Fixed Budget</span>
                </div>
                
                <div className="job-highlight-item">
                  <svg className="job-highlight-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  <span className="job-highlight-value">Any</span>
                  <span className="job-highlight-label">Experience Level</span>
                </div>

                <div className="job-highlight-item">
                  <svg className="job-highlight-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span className="job-highlight-value">Flexible</span>
                  <span className="job-highlight-label">Timeline</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <section className="job-detail-section">
              <h2 className="job-section-title">Job Description</h2>
              <div className="job-description-text">
                {job.description}
              </div>
            </section>

            {/* Skills and Expertise */}
            <section className="job-detail-section">
              <h2 className="job-section-title">Skills and Expertise</h2>
              <div className="job-skills-container">
                {mockSkills.map(skill => (
                  <span key={skill} className="job-skill-tag">{skill}</span>
                ))}
              </div>
            </section>

            {/* Activity on this job */}
            <section className="job-detail-section">
              <h2 className="job-section-title">Activity on this job</h2>
              <div className="job-activity-grid">
                <div className="job-activity-row">
                  <span className="job-activity-label">Proposals</span>
                  <span className="job-activity-value">{mockActivity.proposals}</span>
                </div>
                <div className="job-activity-row">
                  <span className="job-activity-label">Last viewed by client</span>
                  <span className="job-activity-value">{mockActivity.lastViewed}</span>
                </div>
                <div className="job-activity-row">
                  <span className="job-activity-label">Interviewing</span>
                  <span className="job-activity-value">{mockActivity.interviewing}</span>
                </div>
                <div className="job-activity-row">
                  <span className="job-activity-label">Invites sent</span>
                  <span className="job-activity-value">{mockActivity.invitesSent}</span>
                </div>
                <div className="job-activity-row">
                  <span className="job-activity-label">Unanswered invites</span>
                  <span className="job-activity-value">{mockActivity.unansweredInvites}</span>
                </div>
              </div>
            </section>
          </main>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="job-detail-sidebar">
            
            {/* CTA / Action Box */}
            <div className="job-sidebar-card job-cta-box">
              {!isAuthenticated ? (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Interested?</h3>
                  <p style={{ marginBottom: '16px', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    Login as a freelancer to submit a proposal for this job.
                  </p>
                  <Link to="/login" className="btn btn-primary btn-full">
                    Log In to Apply
                  </Link>
                  <Link to="/register" className="btn btn-ghost btn-full mt-2">
                    Create Account
                  </Link>
                </div>
              ) : isOwner ? (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Manage Job</h3>
                  
                  {job.status === 'COMPLETED' ? (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)', padding: '16px',
                      borderRadius: '12px', color: '#059669',
                      fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      ✅ This job is marked completed.
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                        Update the status of this job posting:
                      </p>
                      {statusLoading ? (
                        <p style={{ color: 'var(--color-text-muted)' }}>Updating...</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {job.status === 'OPEN' && (
                            <button
                              className="btn btn-full"
                              style={{ background: '#f59e0b', color: 'white', border: 'none' }}
                              onClick={() => handleStatusUpdate('IN_PROGRESS')}
                            >
                              Mark as In Progress
                            </button>
                          )}
                          <button
                            className="btn btn-full"
                            style={{ background: '#10b981', color: 'white', border: 'none' }}
                            onClick={() => handleStatusUpdate('COMPLETED')}
                          >
                            Mark as Completed
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : user.role === 'CLIENT' ? (
                <div>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>Only freelancers can apply for jobs.</p>
                  <p style={{ fontSize: '0.85rem' }}>
                    Create a freelancer account if you wish to apply.
                  </p>
                </div>
              ) : job.status !== 'OPEN' ? (
                <div style={{
                  background: job.status === 'IN_PROGRESS' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                  padding: '16px', borderRadius: '12px',
                  color: job.status === 'IN_PROGRESS' ? '#d97706' : '#64748b',
                  fontWeight: '700', border: `1px solid ${job.status === 'IN_PROGRESS' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(100, 116, 139, 0.2)'}`
                }}>
                  {job.status === 'IN_PROGRESS' 
                    ? '🟡 Job is currently in progress'
                    : '⚫ Job has been completed'}
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Ready to work?</h3>
                  <p style={{ marginBottom: '16px', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    Submit a proposal to start a conversation with the client.
                  </p>
                  <button
                    className="btn btn-primary btn-full btn-lg"
                    onClick={handleContact}
                    disabled={contactLoading}
                  >
                    {contactLoading ? 'Opening chat...' : 'Apply Now'}
                  </button>
                </>
              )}
            </div>

            {/* Client Profile Box */}
            <div className="job-sidebar-card job-client-box">
              <h3>About the Client</h3>
              <div className="job-client-header">
                <Avatar src={job.client?.avatar} name={job.client?.name} size="md" />
                <div>
                  <p style={{ fontWeight: '700', color: 'var(--color-text)' }}>{job.client?.name}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Verified Client</p>
                </div>
              </div>
              
              <div className="job-client-stats">
                <div className="job-client-stat">
                  <span className="job-client-stat-label">Location</span>
                  <span className="job-client-stat-value">Worldwide</span>
                </div>
                <div className="job-client-stat">
                  <span className="job-client-stat-label">Jobs Posted</span>
                  <span className="job-client-stat-value">1</span>
                </div>
                <div className="job-client-stat">
                  <span className="job-client-stat-label">Member Since</span>
                  <span className="job-client-stat-value">
                    {new Date(job.client?.createdAt || job.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            
          </aside>
        </div>
      </div>
    </div>
  );
}
