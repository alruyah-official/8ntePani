import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import '../components/StarRating.css';
import './ServiceDetail.css';

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

/* ──────────────────────── Image Gallery ──────────────────────── */
function ImageGallery({ images }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="sd-gallery-placeholder">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span>No images available</span>
      </div>
    );
  }

  return (
    <div className="sd-gallery">
      <div className="sd-gallery-main">
        <img src={images[active]} alt={`Service image ${active + 1}`} />
      </div>
      {images.length > 1 && (
        <div className="sd-gallery-thumbs">
          {images.map((img, i) => (
            <button
              key={i}
              className={`sd-gallery-thumb${i === active ? ' active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img src={img} alt={`Thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────── Review Card ───────────────────────── */
function ReviewCard({ review, currentUser, onDelete, deleting }) {
  const isOwn = currentUser?.id === review.clientId;
  return (
    <div className="sd-review-card">
      <div className="sd-review-header">
        <Avatar src={review.client?.avatar} name={review.client?.name || 'User'} size="sm" />
        <div className="sd-review-meta">
          <span className="sd-review-author">{review.client?.name || 'Anonymous'}</span>
          <span className="sd-review-date">{relativeDate(review.createdAt)}</span>
        </div>
        <div className="sd-review-stars">
          <StarRating rating={review.rating} size={14} interactive={false} />
        </div>
      </div>
      {review.comment && (
        <p className="sd-review-comment">{review.comment}</p>
      )}
      {!review.comment && (
        <p className="sd-review-no-comment">No comment provided.</p>
      )}
      {isOwn && (
        <button
          className="btn btn-danger btn-sm sd-review-delete"
          onClick={() => onDelete(review.id)}
          disabled={deleting === review.id}
        >
          {deleting === review.id ? (
            <span className="spinner" style={{ width: 14, height: 14 }} />
          ) : (
            'Delete'
          )}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────── Review Form ────────────────────────── */
function ReviewForm({ serviceId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating < 1) { setError('Please select a rating.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/reviews', { serviceId, rating, comment: comment.trim() || undefined });
      setRating(0);
      setComment('');
      onSuccess();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('You have already reviewed this service.');
      } else {
        setError(err.response?.data?.message || 'Failed to submit review.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="sd-review-form" onSubmit={handleSubmit} noValidate>
      <h3 className="sd-review-form-title">Leave a Review</h3>
      {error && <div className="error-banner">{error}</div>}
      <div className="sd-review-form-rating">
        <label className="form-label">Your Rating</label>
        <StarRating rating={rating} size={28} interactive onRate={setRating} />
      </div>
      <div className="form-group">
        <label htmlFor="review-comment" className="form-label">Comment (optional)</label>
        <textarea
          id="review-comment"
          className="form-textarea"
          placeholder="Share your experience with this service…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={4}
        />
      </div>
      <button
        type="submit"
        className={`btn btn-primary btn-full${loading ? ' btn-loading' : ''}`}
        disabled={loading}
      >
        {loading ? '' : 'Submit Review'}
      </button>
    </form>
  );
}

/* ───────────────────────── Main Page ────────────────────────── */
export default function ServiceDetail() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [deletingReview, setDeletingReview] = useState(null);

  const fetchService = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/services/${serviceId}`);
      setService(res.data.data.service);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load service.');
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => { fetchService(); }, [fetchService]);

  const handleContact = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setContactLoading(true);
    try {
      const res = await api.post('/api/conversations', { freelancerId: service.freelancerId });
      navigate(`/messages/${res.data.data.conversation.id}`);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      setContactLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setDeletingReview(reviewId);
    try {
      await api.delete(`/api/reviews/${reviewId}`);
      setService((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((r) => r.id !== reviewId),
      }));
    } catch (err) {
      console.error('Failed to delete review:', err);
    } finally {
      setDeletingReview(null);
    }
  };

  /* ── derived state ── */
  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading service…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-error-state">
        <div className="error-banner">{error}</div>
        <button className="btn btn-primary" onClick={fetchService}>Retry</button>
      </div>
    );
  }

  if (!service) return null;

  const freelancer = service.freelancer;
  const profile = freelancer?.freelancerProfile;
  const reviews = service.reviews || [];

  const isClient = user?.role === 'CLIENT';
  const isOwner = user?.id === service.freelancerId;
  const canInteract = isClient && !isOwner;

  const userAlreadyReviewed = reviews.some((r) => r.clientId === user?.id);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="page-wrapper sd-upwork-page">
      <div className="container sd-upwork-container">
        
        {/* ── LEFT: Main Content ── */}
        <main className="sd-upwork-main">
          
          {/* Header Area */}
          <div className="sd-upwork-header">
            <h1 className="sd-upwork-title">{service.title}</h1>
            
            <div className="sd-upwork-badges">
              <span className="badge-new">New</span>
              <span className="badge-meta">Fixed-price • Posted recently</span>
              {service.category?.name && (
                <span className="badge-meta">• {service.category.name}</span>
              )}
            </div>
            
            <div className="sd-upwork-details-grid">
              <div className="upwork-detail-block">
                <svg className="upwork-detail-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <div className="upwork-detail-text">
                  <span className="upwork-detail-value">${parseFloat(service.price).toLocaleString()}</span>
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
                  <span className="upwork-detail-value">{service.deliveryDays} Days</span>
                  <span className="upwork-detail-label">Delivery Time</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="sd-upwork-divider" />

          {/* Description */}
          <section className="sd-upwork-section">
            <h2 className="sd-upwork-heading">Project Description</h2>
            <div className="sd-upwork-description">
              {service.description.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </section>

          <hr className="sd-upwork-divider" />

          {/* Gallery (Secondary position for Upwork style) */}
          {service.images?.length > 0 && (
            <>
              <section className="sd-upwork-section">
                <h2 className="sd-upwork-heading">Project Files / Portfolio</h2>
                <ImageGallery images={service.images} />
              </section>
              <hr className="sd-upwork-divider" />
            </>
          )}

          {/* Reviews */}
          <section className="sd-upwork-section" id="reviews">
            <div className="sd-reviews-heading-row">
              <h2 className="sd-upwork-heading">
                Reviews
                {reviews.length > 0 && (
                  <span className="sd-reviews-count-badge">{reviews.length}</span>
                )}
              </h2>
            </div>

            {/* Review form / status */}
            {isAuthenticated ? (
              canInteract ? (
                userAlreadyReviewed ? (
                  <div className="success-banner sd-already-reviewed">
                    ✓ You've already reviewed this service.
                  </div>
                ) : (
                  <ReviewForm serviceId={serviceId} onSuccess={fetchService} />
                )
              ) : null
            ) : (
              <div className="sd-login-prompt">
                <p>
                  <Link to="/login">Log in</Link> to leave a review.
                </p>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="empty-state sd-empty-reviews">
                <p>No reviews yet.</p>
              </div>
            ) : (
              <div className="sd-reviews-list">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    currentUser={user}
                    onDelete={handleDeleteReview}
                    deleting={deletingReview}
                  />
                ))}
              </div>
            )}
          </section>
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
                    {contactLoading ? '' : 'Contact Freelancer'}
                  </button>
                  <p className="upwork-cta-hint">Response time usually within 1 hour.</p>
                </>
              ) : (
                <div className="sd-owner-notice">You cannot hire your own service.</div>
              )
            ) : (
              <div className="sd-auth-cta">
                <Link to="/login" className="btn btn-primary btn-full upwork-cta-btn">Log In to Hire</Link>
                <Link to="/register" className="btn btn-ghost btn-full mt-2">Create Account</Link>
              </div>
            )}
          </div>

          {/* Freelancer Profile Box */}
          <div className="sd-upwork-box freelancer-box">
            <h3 className="freelancer-box-title">About the Freelancer</h3>
            
            <div className="freelancer-box-identity">
              <Avatar src={freelancer?.avatar} name={freelancer?.name || 'Freelancer'} size="lg" />
              <div className="freelancer-box-info">
                <Link to={`/profile/${freelancer?.id}`} className="freelancer-name">
                  {freelancer?.name}
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
                
                {/* Rating if available globally */}
                <div className="freelancer-rating-sm">
                  <StarRating rating={avgRating} size={12} interactive={false} />
                  <span>{avgRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {profile?.bio && (
              <p className="freelancer-bio-excerpt">{profile.bio}</p>
            )}

            {profile?.skills?.length > 0 && (
              <div className="freelancer-meta-section">
                <span className="meta-label">Skills</span>
                <div className="upwork-tag-list">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="upwork-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {profile?.languages?.length > 0 && (
              <div className="freelancer-meta-section">
                <span className="meta-label">Languages</span>
                <div className="upwork-tag-list">
                  {profile.languages.map((lang) => (
                    <span key={lang} className="upwork-tag alt-tag">{lang}</span>
                  ))}
                </div>
              </div>
            )}
            
            <hr className="freelancer-box-divider" />
            <Link to={`/profile/${freelancer?.id}`} className="btn btn-secondary btn-full">
              View Full Profile
            </Link>
          </div>
          
        </aside>
      </div>
    </div>
  );
}
