import '../styles/components/ServiceCard.css';
import { Link } from 'react-router-dom';

function ServiceCard({ service }) {
  const { id, title, description, price, freelancer, createdAt } = service;

  // Calculate relative time
  const postedDate = new Date(createdAt);
  const diffTime = Math.abs(new Date() - postedDate);
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  const postedTime = diffDays > 0 ? `${diffDays} days ago` : diffHours > 0 ? `${diffHours} hours ago` : 'Just now';
  const isNew = diffDays <= 7; // Show "New" tag if posted within the last 7 days

  // Wire up experienceLevel to the backend data (when the backend developer includes it), fallback if empty
  const experienceLevel = service.experienceLevel || "Intermediate";
  
  // Wire up location to the backend data (when the backend developer includes it), fallback if empty
  const location = freelancer?.freelancerProfile?.location || freelancer?.profile?.location || "Location not set";

  const initials = freelancer?.name
    ? freelancer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <Link to={`/services/${id}`} className="service-card" aria-label={`View service: ${title}`}>
      <div className="service-card-body">
        
        {/* Freelancer Profile Block */}
        <div className="service-card-freelancer-block">
          {freelancer?.avatar ? (
            <img src={freelancer.avatar} alt={freelancer?.name} className="service-card-avatar" />
          ) : (
            <div className="service-card-avatar-placeholder">{initials}</div>
          )}
          <div className="service-card-freelancer-info">
            <span className="service-card-freelancer-name">{freelancer?.name || 'Unknown Freelancer'}</span>
            <span className="service-card-freelancer-location">{location}</span>
          </div>
        </div>
        
        <h3 className="service-card-title">{title}</h3>
        
        <div className="service-card-badges">
          {isNew && <span className="badge-new">New</span>}
          <span className="badge-meta">Fixed-price - Posted {postedTime}</span>
        </div>

        <div className="service-card-details">
          <div className="detail-block">
            <svg className="detail-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            <div className="detail-text">
              <span className="detail-value">${parseFloat(price || 0).toLocaleString()}</span>
              <span className="detail-label">Fixed-price</span>
            </div>
          </div>
          
          <div className="detail-block">
            <svg className="detail-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <div className="detail-text">
              <span className="detail-value">{experienceLevel}</span>
              <span className="detail-label">Experience level</span>
            </div>
          </div>
        </div>

        <p className="service-card-description">{description}</p>
        
        <div className="service-card-action">
          <button className="service-card-cta">See more</button>
        </div>
      </div>
    </Link>
  );
}

export default ServiceCard;
