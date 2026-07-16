import './Home.css';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ServiceCard from '../components/ServiceCard';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFreelancer = user?.role === 'FREELANCER';
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories once
  useEffect(() => {
    api.get('/api/categories')
      .then(res => setCategories(res.data.data.categories))
      .catch(() => {}); // non-critical
  }, []);

  // Fetch services whenever filters change
  const fetchServices = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCategory) params.categoryId = selectedCategory;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    api.get('/api/services', { params })
      .then(res => {
        setServices(res.data.data.services);
      })
      .catch(() => setError('Failed to load services. Please try again.'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(prev => prev === categoryId ? '' : categoryId);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters = search || selectedCategory || minPrice || maxPrice;

  const ServiceSkeleton = () => (
    <div className="service-skeleton">
      <div className="skeleton service-skeleton-img" />
      <div className="service-skeleton-body">
        <div className="skeleton" style={{ height: '14px', width: '40%' }} />
        <div className="skeleton" style={{ height: '24px', width: '90%', marginTop: '12px' }} />
        <div className="skeleton" style={{ height: '16px', width: '80%', marginTop: '8px' }} />
        <div className="skeleton" style={{ height: '16px', width: '50%', marginTop: '8px' }} />
      </div>
      <div className="service-skeleton-footer">
        <div className="skeleton" style={{ height: '16px', width: '30%' }} />
        <div className="skeleton" style={{ height: '20px', width: '40%' }} />
      </div>
    </div>
  );

  return (
    <div className="home">
      {/* ─── Premium SaaS Hero ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-glow hero-glow-1"></div>
          <div className="hero-glow hero-glow-2"></div>
          <div className="hero-grid"></div>
        </div>

        <div className="container hero-container">
          {isFreelancer ? (
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge badge-primary">
                  <span className="hero-badge-dot"></span>
                  Freelancer Hub
                </span>
              </div>
              <h1 className="hero-title">
                Grow your business <br />
                <span className="text-gradient">and reach new clients.</span>
              </h1>
              <p className="hero-subtitle">
                Manage your active services, respond to messages, and scale your freelance career with startups looking for your unique skills.
              </p>
              <div className="hero-cta-group">
                <button 
                  className="btn btn-primary btn-lg hero-cta-primary" 
                  onClick={() => window.location.href='/dashboard'}
                >
                  Go to Dashboard
                </button>
                <div className="hero-trust-indicators">
                  <span className="hero-trust-text">Maximize your earnings today</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge badge-primary">
                  <span className="hero-badge-dot"></span>
                  The #1 Student Marketplace
                </span>
              </div>
              <h1 className="hero-title">
                Hire top student talent <br />
                <span className="text-gradient">for your next big idea.</span>
              </h1>
              <p className="hero-subtitle">
                Scale your startup with ambitious, verified students offering world-class services in engineering, design, and marketing at a fraction of the cost.
              </p>
              <div className="hero-cta-group">
                <button className="btn btn-primary btn-lg hero-cta-primary" onClick={() => navigate('/explore')}>
                  Explore Services
                </button>
                <div className="hero-trust-indicators">
                  <div className="hero-trust-stars">
                    {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                  </div>
                  <span className="hero-trust-text">Trusted by 500+ startups</span>
                </div>
              </div>
            </div>
          )}

          {/* Floating UI Mockup Illustration */}
          <div className="hero-visual">
            <div className="hero-mockup-wrapper animate-float">
              {/* Main Dashboard Card */}
              <div className="mockup-card mockup-main">
                <div className="mockup-header">
                  <div className="mockup-dots"><span></span><span></span><span></span></div>
                  <div className="mockup-header-text">Freelancer Dashboard</div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-stat-row">
                    <div className="mockup-stat-box">
                      <span className="mockup-stat-label">Total Earnings</span>
                      <span className="mockup-stat-value">$12,450</span>
                    </div>
                    <div className="mockup-stat-box">
                      <span className="mockup-stat-label">Active Orders</span>
                      <span className="mockup-stat-value text-gradient">14</span>
                    </div>
                  </div>
                  <div className="mockup-chart">
                    <div className="mockup-bar" style={{ height: '40%' }}></div>
                    <div className="mockup-bar" style={{ height: '60%' }}></div>
                    <div className="mockup-bar" style={{ height: '30%' }}></div>
                    <div className="mockup-bar" style={{ height: '80%', background: 'var(--gradient-primary)' }}></div>
                    <div className="mockup-bar" style={{ height: '50%' }}></div>
                  </div>
                </div>
              </div>

              {/* Floating Element 1 (Service Card) */}
              <div className="mockup-card mockup-float-1 animate-float-delayed">
                <div className="mockup-service-image"></div>
                <div className="mockup-service-body">
                  <div className="skeleton" style={{ width: '80%', height: '10px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ width: '60%', height: '10px' }}></div>
                  <div className="mockup-service-footer">
                    <span className="mockup-service-price">$450</span>
                    <div className="mockup-stars">★★★★★</div>
                  </div>
                </div>
              </div>

              {/* Floating Element 2 (Profile Bubble) */}
              <div className="mockup-card mockup-float-2 animate-float-slow">
                <img src="https://i.pravatar.cc/100?img=32" alt="Student Freelancer" className="mockup-avatar" />
                <div className="mockup-profile-info">
                  <span className="mockup-profile-name">Sarah Jenkins</span>
                  <span className="mockup-profile-role">UI/UX Designer</span>
                </div>
                <span className="mockup-badge">Top Rated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trusted By Section ──────────────────────────────────────────────── */}
      <section className="trusted-by">
        <div className="container">
          <p className="trusted-by-title">Trusted By</p>
          <div className="trusted-by-logos" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4rem' }}>
            <img src="/connectemea.png" alt="Connect EMEA" className="trusted-by-logo" style={{ height: '45px', width: 'auto', maxHeight: 'none' }} />
            <img src="/emea%20college.png" alt="EMEA College" className="trusted-by-logo" style={{ height: '65px', width: 'auto', maxHeight: 'none' }} />
          </div>
        </div>
      </section>

      {/* ─── Search & Marketplace ────────────────────────────────────────────── */}
      <section id="marketplace" className="home-marketplace">
        <div className="container">
          
          {/* New Category Grid Section */}
          <div className="home-category-grid-section" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-8)' }}>Find freelancers for every type of work</h2>
            
            {loading ? (
              <div className="category-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="category-card skeleton" style={{ height: '140px', borderRadius: '12px' }}></div>
                ))}
              </div>
            ) : (
              <div className="category-grid">
                {categories.map((cat, i) => (
                  <div key={cat.id} className="category-card" onClick={() => navigate(`/explore?category=${cat.id}`)}>
                    <div className="category-card-icon">
                      {/* Using a generic icon for now, ideally matched by category slug */}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                      </svg>
                    </div>
                    <h3 className="category-card-title">{cat.name}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
