import React from 'react';
import { useNavigate } from 'react-router-dom';

// We use useNavigate to handle the programmatic navigation when the card is clicked.
// A functional component taking a service object as prop to display service details.
const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const {
    id,
    title,
    price,
    deliveryDays,
    images = [],
    category,
    freelancer,
  } = service;

  // Render the first image or a placeholder if there are no images available.
  // The placeholder provides a consistent fallback UI when images are missing.
  const displayImage = images.length > 0 ? (
    <img
      src={images[0]}
      alt={title}
      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
    />
  ) : (
    <div
      style={{
        height: '180px',
        backgroundColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
      }}
    >
      No Image
    </div>
  );

  // Avatar logic: check if avatar exists, else extract first letter of name for initials.
  // This provides a personal touch even when the freelancer hasn't uploaded a photo.
  const avatarDisplay = freelancer?.avatar ? (
    <img
      src={freelancer.avatar}
      alt={freelancer.name}
      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
    />
  ) : (
    <div
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: '#4f46e5',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 'bold',
      }}
    >
      {freelancer?.name ? freelancer.name.charAt(0).toUpperCase() : '?'}
    </div>
  );

  return (
    <div
      onClick={() => navigate(`/services/${id}`)}
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      // Interactive hover effect implemented via inline handlers for simplicity.
      // This is necessary since we're writing plain React components with basic inline styles without styled-components/modules.
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
      }}
    >
      {displayImage}

      <div style={{ padding: '0.75rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          {/* Badge style for category helps it stand out visually from other text. */}
          <span
            style={{
              backgroundColor: '#ede9fe',
              color: '#6d28d9',
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              display: 'inline-block',
            }}
          >
            {category?.name || 'Uncategorized'}
          </span>
        </div>

        {/* The title has max 2 lines with overflow hidden to keep card heights consistent. */}
        <h3
          style={{
            fontWeight: 'bold',
            fontSize: '1rem',
            margin: '0 0 0.5rem 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          {avatarDisplay}
          <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>
            {freelancer?.name || 'Unknown'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          {/* Price displayed in bold Indigo color for emphasis. */}
          <span style={{ color: '#4f46e5', fontWeight: 'bold' }}>
            Starting at ₹{price}
          </span>
          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
            {deliveryDays} days delivery
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
