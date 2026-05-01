import { Star } from 'lucide-react';

const CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'design', label: 'Design' },
    { value: 'development', label: 'Development' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'video', label: 'Video & Animation' },
    { value: 'writing', label: 'Writing' },
    { value: 'music', label: 'Music & Audio' },
    { value: 'business', label: 'Business' },
    { value: 'ai', label: 'AI Services' },
];

const DELIVERY_OPTIONS = [
    { value: '', label: 'Any' },
    { value: '1', label: 'Up to 1 day' },
    { value: '3', label: 'Up to 3 days' },
    { value: '7', label: 'Up to 7 days' },
];

export default function FilterSidebar({ filters, setFilter, clearFilters }) {
    const hasActiveFilters = Object.entries(filters)
        .some(([k, v]) => k !== 'sort' && k !== 'page' && v !== '');

    return (
        <aside style={{
            width: 220, flexShrink: 0,
            background: '#111', border: '1px solid #1e1e1e',
            borderRadius: 14, padding: 20, height: 'fit-content',
            position: 'sticky', top: 80,
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, color: '#fafafa' }}>Filters</span>
                {hasActiveFilters && (
                    <button onClick={clearFilters} style={{
                        background: 'none', border: 'none', color: '#C8F135',
                        fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif',
                    }}>Clear all</button>
                )}
            </div>

            {/* Category */}
            <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, color: '#666', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>CATEGORY</label>
                {CATEGORIES.map(cat => (
                    <button key={cat.value} onClick={() => setFilter('category', cat.value)}
                        style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            padding: '7px 10px', borderRadius: 8, border: 'none',
                            background: filters.category === cat.value ? 'rgba(200,241,53,0.1)' : 'transparent',
                            color: filters.category === cat.value ? '#C8F135' : '#888',
                            fontSize: 13, cursor: 'pointer', marginBottom: 2,
                            fontFamily: 'DM Sans,sans-serif',
                            transition: 'all 0.15s',
                        }}
                    >{cat.label}</button>
                ))}
            </div>

            {/* Budget */}
            <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, color: '#666', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>BUDGET ($)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" placeholder="Min" value={filters.minPrice}
                        onChange={e => setFilter('minPrice', e.target.value)}
                        style={inputStyle} />
                    <input type="number" placeholder="Max" value={filters.maxPrice}
                        onChange={e => setFilter('maxPrice', e.target.value)}
                        style={inputStyle} />
                </div>
            </div>

            {/* Delivery Time */}
            <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, color: '#666', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>DELIVERY TIME</label>
                {DELIVERY_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setFilter('deliveryDays', opt.value)}
                        style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            padding: '7px 10px', borderRadius: 8, border: 'none',
                            background: filters.deliveryDays === opt.value ? 'rgba(200,241,53,0.1)' : 'transparent',
                            color: filters.deliveryDays === opt.value ? '#C8F135' : '#888',
                            fontSize: 13, cursor: 'pointer', marginBottom: 2,
                            fontFamily: 'DM Sans,sans-serif', transition: 'all 0.15s',
                        }}
                    >{opt.label}</button>
                ))}
            </div>

            {/* Minimum Rating */}
            <div>
                <label style={{ fontSize: 12, color: '#666', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>MIN RATING</label>
                {[4, 3, 2].map(r => (
                    <button key={r} onClick={() => setFilter('rating', filters.rating == r ? '' : r)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                            padding: '7px 10px', borderRadius: 8, border: 'none',
                            background: Number(filters.rating) === r ? 'rgba(200,241,53,0.1)' : 'transparent',
                            color: Number(filters.rating) === r ? '#C8F135' : '#888',
                            fontSize: 13, cursor: 'pointer', marginBottom: 2,
                            fontFamily: 'DM Sans,sans-serif', transition: 'all 0.15s',
                        }}
                    >
                        {Array.from({ length: r }).map((_, i) => (
                            <Star key={i} size={12} fill="#C8F135" color="#C8F135" />
                        ))}
                        <span>{r}+ stars</span>
                    </button>
                ))}
            </div>
        </aside>
    );
}

const inputStyle = {
    width: '100%', background: '#161616', border: '1px solid #2a2a2a',
    borderRadius: 8, color: '#fafafa', fontSize: 13, padding: '7px 10px',
    fontFamily: 'DM Sans,sans-serif', outline: 'none',
};