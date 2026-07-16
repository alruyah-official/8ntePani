/* ─── StarRating Component ────────────────────────────────────────────────── */

function StarRating({ rating, maxRating = 5, size = 16, interactive = false, onRate }) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  return (
    <div className="star-rating" aria-label={`Rating: ${rating} out of ${maxRating}`}>
      {stars.map(star => (
        <button
          key={star}
          type="button"
          className={`star ${star <= Math.round(rating) ? 'star-filled' : 'star-empty'} ${interactive ? 'star-interactive' : ''}`}
          style={{ fontSize: size, width: size + 4, height: size + 4 }}
          onClick={interactive && onRate ? () => onRate(star) : undefined}
          aria-label={interactive ? `Rate ${star} star${star !== 1 ? 's' : ''}` : undefined}
          disabled={!interactive}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default StarRating;
