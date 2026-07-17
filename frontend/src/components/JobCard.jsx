import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function JobCard({ job }) {
  const { id, title, description, budget, price, category, client, createdAt, status } = job;
  const { isAuthenticated } = useAuth();
  
  // Calculate relative time
  const postedDate = new Date(createdAt);
  const diffTime = Math.abs(new Date() - postedDate);
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const postedString = diffDays > 0 ? `${diffDays} days ago` : diffHours > 0 ? `${diffHours} hours ago` : 'Just now';

  const displayBudget = budget || price;

  const initials = client?.name
    ? client.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <Link to={isAuthenticated ? `/jobs/${id}` : '/login'} className="premium-job-card">
      <div className="job-card-header">
        <div>
          <h3 className="job-card-title">{title}</h3>
          <span className="job-card-meta-text">Posted {postedString}</span>
        </div>
        {displayBudget && (
          <div className="job-card-price-badge">
            ₹{parseFloat(displayBudget).toLocaleString()}
          </div>
        )}
      </div>

      <p className="job-card-desc">{description}</p>

      <div className="job-card-tags">
        {category && <span className="job-tag">{category.name}</span>}
        <span className="job-tag">{status === 'OPEN' ? '🟢 Accepting Proposals' : 'Closed'}</span>
        <span className="job-tag">Remote</span>
      </div>

      <div className="job-card-footer">
        <div className="job-client-info">
          {client?.avatar ? (
            <img src={client.avatar} alt={client.name} className="job-client-avatar" />
          ) : (
            <div className="job-client-avatar">{initials}</div>
          )}
          <span>{client?.name || 'Client'}</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-primary)' }}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  );
}

export default JobCard;
