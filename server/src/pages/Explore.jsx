import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Filter } from 'lucide-react';
import GigCard from '../components/shared/GigCard';
import { useGigs } from '../hooks/useGigs';
import { useDebounce } from '../hooks/useDebounce';
import { useSearchParams } from 'react-router-dom';

const categories = ['All', 'Design', 'Development', 'Marketing', 'Video', 'Writing', 'Music', 'Business', 'AI'];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read filters from URL
  const category = searchParams.get('category') || 'All';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const delivery = searchParams.get('delivery') || '';
  const rating = searchParams.get('rating') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const debouncedSearch = useDebounce(search, 400);

  // Build API params
  const apiParams = {
    ...(category !== 'All' && { category: category.toLowerCase() }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(delivery && { deliveryDays: delivery }),
    ...(rating && { rating }),
    ...(debouncedSearch && { search: debouncedSearch }),
    page,
    limit: 9,
  };

  const { data, isLoading, isError } = useGigs(apiParams);

  // Only use real API data
  const gigs = data?.data || [];
  const total = data?.total ?? 0;

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  }

  const hasActiveFilters = minPrice || maxPrice || delivery || rating || (category !== 'All') || search;

  return (
    <div className="flex flex-col w-full pb-20">

      {/* Sticky category bar */}
      <div className="sticky top-16 z-40 bg-primary/90 backdrop-blur-md border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex overflow-x-auto gap-3 hide-scrollbar snap-x">
          {categories.map(cat => (
            <button key={cat}
              onClick={() => updateFilter('category', cat === 'All' ? '' : cat)}
              className={`snap-start whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-colors border ${category === cat || (cat === 'All' && category === 'All')
                  ? 'bg-text-primary text-primary border-text-primary'
                  : 'bg-surface border-border text-muted hover:border-accent hover:text-accent'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 py-12 flex flex-col md:flex-row gap-10">

        {/* Filter sidebar */}
        <aside className="w-full md:w-[250px] shrink-0 flex flex-col gap-10">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2 font-display font-bold text-xl">
              <Filter className="w-5 h-5 text-accent" /> Filters
            </div>
            {hasActiveFilters && (
              <button onClick={() => setSearchParams({})} style={{ background: 'none', border: 'none', color: '#C8F135', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                Clear all
              </button>
            )}
          </div>

          {/* Budget */}
          <div>
            <h3 className="font-bold mb-4 text-text-primary text-lg">Budget</h3>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" value={minPrice}
                onChange={e => updateFilter('minPrice', e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 outline-none focus:border-accent transition-colors"
              />
              <span className="text-muted">-</span>
              <input type="number" placeholder="Max" value={maxPrice}
                onChange={e => updateFilter('maxPrice', e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Delivery Time */}
          <div>
            <h3 className="font-bold mb-4 text-text-primary text-lg">Delivery Time</h3>
            <div className="flex flex-col gap-3">
              {['Anytime', 'Express (24h)', 'Up to 3 days', 'Up to 7 days'].map(time => (
                <label key={time} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="delivery"
                    checked={delivery === time || (time === 'Anytime' && !delivery)}
                    onChange={() => updateFilter('delivery', time === 'Anytime' ? '' : time)}
                    className="w-4 h-4 accent-accent"
                  />
                  <span className="text-sm font-medium text-muted group-hover:text-text-primary transition-colors">{time}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="font-bold mb-4 text-text-primary text-lg">Seller Rating</h3>
            <div className="flex flex-col gap-3">
              {[4.5, 4.0, 3.0].map(star => (
                <label key={star} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="rating"
                    checked={rating === star.toString()}
                    onChange={() => updateFilter('rating', star.toString())}
                    className="w-4 h-4 accent-accent"
                  />
                  <div className="flex items-center gap-1.5 text-sm font-medium text-muted group-hover:text-text-primary transition-colors">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span>{star} & up</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main grid */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              {category === 'All' ? 'Explore all gigs' : `${category} services`}
            </h1>
            <span className="text-sm text-accent font-semibold bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
              {isLoading ? 'Searching...' : `${total} gigs found`}
            </span>
          </div>

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{ background: '#111', borderRadius: 16, height: 280, border: '1px solid #1e1e1e', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#f87171' }}>
              <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Could not connect to server</p>
              <p style={{ fontSize: 14, color: '#888' }}>Make sure the backend is running on port 3030.</p>
            </div>
          )}

          {/* Gig grid */}
          {!isLoading && (
            gigs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
                No gigs found. Try adjusting your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {gigs.map(gig => <GigCard key={gig.id} gig={gig} />)}
              </div>
            )
          )}

          {/* Load more */}
          {gigs.length > 0 && !isLoading && (
            <div className="flex justify-center mt-auto border-t border-border pt-12">
              <button onClick={() => updateFilter('page', page + 1)}
                className="border border-border text-muted px-8 py-3 rounded-full hover:border-accent hover:text-accent transition-colors font-bold"
              >
                Load More Gigs
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes shimmer { 0%,100%{opacity:.4} 50%{opacity:.8} }
        .hide-scrollbar::-webkit-scrollbar { display:none; }
        .hide-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}