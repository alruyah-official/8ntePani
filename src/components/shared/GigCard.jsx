import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function GigCard({ gig }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  function handleMouseMove(e) {
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -6;
    const rotY = ((x - cx) / cx) * 6;
    setTransform(`perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`);
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.08 });
  }

  function handleMouseLeave() {
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)');
    setGlare(g => ({ ...g, opacity: 0 }));
  }

  const { id, thumbnail, category, title, rating, reviewCount, price, sellerName, sellerAvatar } = gig || {};

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/gig/${id}`)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transform,
        transition: 'transform 0.15s ease, box-shadow 0.3s ease',
        boxShadow: transform ? '0 20px 60px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.3)',
        position: 'relative',
      }}
    >
      {/* Glare overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', borderRadius: 16,
        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
        transition: 'opacity 0.2s',
      }} />

      {/* Thumbnail */}
      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', position: 'relative' }}>
        <img
          src={thumbnail || `https://picsum.photos/seed/${id}/400/240`}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        {/* Category badge */}
        <span style={{
          position: 'absolute', top: 10, left: 10, zIndex: 3,
          background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(6px)',
          color: '#C8F135', fontSize: 10, fontWeight: 700,
          padding: '3px 10px', borderRadius: 999,
          fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>{category}</span>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px' }}>
        <h3 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
          color: '#fafafa', lineHeight: 1.4, marginBottom: 10,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{title}</h3>

        {/* Seller row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <img
            src={sellerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName || 'S')}&background=111&color=C8F135&size=24`}
            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
            alt={sellerName}
          />
          <span style={{ fontSize: 12, color: '#888', fontFamily: 'DM Sans, sans-serif' }}>{sellerName}</span>
        </div>

        {/* Rating + price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={12} fill="#F5A623" color="#F5A623" />
            <span style={{ fontSize: 12, color: '#fafafa', fontWeight: 600 }}>{Number(rating || 0).toFixed(1)}</span>
            <span style={{ fontSize: 11, color: '#555' }}>({reviewCount || 0}){' '}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#555', marginRight: 2 }}>From</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#C8F135', fontFamily: 'Syne, sans-serif' }}>${price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}