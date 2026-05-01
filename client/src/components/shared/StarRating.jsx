import { useState } from 'react';
import { Star } from 'lucide-react';

// Display-only star rating
export function StarRating({ rating = 0, size = 14, showNumber = true }) {
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={size}
                    fill={i < Math.round(rating) ? '#F5A623' : 'transparent'}
                    color={i < Math.round(rating) ? '#F5A623' : '#333'}
                />
            ))}
            {showNumber && (
                <span style={{ fontSize: size, color: '#888', marginLeft: 2 }}>{Number(rating).toFixed(1)}</span>
            )}
        </div>
    );
}

// Interactive star picker — for submitting reviews
export function StarPicker({ value = 0, onChange, size = 22 }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div style={{ display: 'inline-flex', gap: 4 }}>
            {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < (hovered || value);
                return (
                    <Star key={i} size={size}
                        fill={filled ? '#F5A623' : 'transparent'}
                        color={filled ? '#F5A623' : '#444'}
                        style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                        onMouseEnter={() => setHovered(i + 1)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => onChange(i + 1)}
                    />
                );
            })}
        </div>
    );
}

// Review card component
export function ReviewCard({ review }) {
    const { reviewer, rating, comment, createdAt } = review;
    return (
        <div style={{
            background: '#111', border: '1px solid #1e1e1e', borderRadius: 12,
            padding: 18, marginBottom: 12,
        }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <img
                    src={reviewer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewer?.name || 'U')}&background=111&color=C8F135&size=36`}
                    style={{ width: 36, height: 36, borderRadius: '50%' }} alt="" />
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fafafa' }}>{reviewer?.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <StarRating rating={rating} size={12} showNumber={false} />
                        <span style={{ fontSize: 11, color: '#555' }}>{createdAt ? new Date(createdAt).toLocaleDateString() : ''}</span>
                    </div>
                </div>
            </div>
            <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6 }}>{comment}</p>
        </div>
    );
}