import './ServiceCard.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function JobCard({ job }) {
  const { id, title, description, price, client } = job;
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mocking data based on reference image
  const isNew = true;
  const postedTime = "7 hours ago";
  const experienceLevel = "Intermediate";
  const location = client?.clientProfile?.location || "Lagos, Nigeria"; // Fallback to reference location

  const initials = client?.name
    ? client.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const handleClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/jobs/${id}`);
    }
  };

  return (
    <a href={`/jobs/${id}`} onClick={handleClick} className="service-card" aria-label={`View job: ${title}`}>
      <div className="service-card-body">
        
        {/* Removed Client Profile Block to limit information */}
        
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
    </a>
  );
}

export default JobCard;
