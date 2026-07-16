import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import './Explore.css';

// Reusing the skeleton from Home for consistency, or defining a simple one here
function ServiceSkeleton() {
  return (
    <div className="service-card skeleton-card" style={{ height: '320px', borderRadius: '16px' }}>
      <div className="skeleton-image" style={{ height: '160px', background: '#e2e8f0' }}></div>
      <div className="skeleton-body" style={{ padding: '20px' }}>
        <div className="skeleton-line title" style={{ height: '24px', background: '#cbd5e1', marginBottom: '12px', width: '80%', borderRadius: '4px' }}></div>
        <div className="skeleton-line" style={{ height: '16px', background: '#e2e8f0', marginBottom: '24px', width: '60%', borderRadius: '4px' }}></div>
        <div className="skeleton-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton-line price" style={{ height: '20px', width: '40px', background: '#cbd5e1', borderRadius: '4px' }}></div>
          <div className="skeleton-line rating" style={{ height: '20px', width: '60px', background: '#e2e8f0', borderRadius: '4px' }}></div>
        </div>
      </div>
    </div>
  );
}

function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters from URL if they exist
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Update state when URL params change (e.g. user clicks a category on homepage)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setDebouncedSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories
  useEffect(() => {
    api.get('/api/categories')
      .then(res => setCategories(res.data.data.categories))
      .catch(() => {});
  }, []);

  // Fetch services
  const fetchServices = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCategory) params.categoryId = selectedCategory;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    // Update URL with current filters to make shareable
    const newSearchParams = new URLSearchParams();
    if (debouncedSearch) newSearchParams.set('search', debouncedSearch);
    if (selectedCategory) newSearchParams.set('category', selectedCategory);
    setSearchParams(newSearchParams, { replace: true });

    api.get('/api/services', { params })
      .then(res => {
        setServices(res.data.data.services);
      })
      .catch(() => setError('Failed to load services. Please try again.'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, selectedCategory, minPrice, maxPrice, setSearchParams]);

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
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = debouncedSearch || selectedCategory || minPrice || maxPrice;

  return (
    <div className="explore-page">
      <div className="container">
        
        <div className="explore-header">
          <h1 className="explore-title text-gradient">Discover Services</h1>
          <p className="explore-subtitle">
            Find exactly what you need to grow your business, built by ambitious student talent.
          </p>
          
          <div className="explore-search-wrapper">
            <div className="explore-search-group glass">
              <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="explore-search-input"
                placeholder="What service are you looking for?"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="explore-search-clear" onClick={() => setSearch('')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="explore-content-layout">
          {/* Sidebar */}
          <aside className="explore-sidebar glass">
            <div className="explore-sidebar-section">
              <h3 className="explore-sidebar-title">Categories</h3>
              <div className="explore-category-list">
                <button
                  className={`explore-category-item ${selectedCategory === '' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('')}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`explore-category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="explore-sidebar-section">
              <h3 className="explore-sidebar-title">Budget</h3>
              <div className="explore-price-filter-vertical">
                <div className="price-input-wrapper">
                  <span className="price-symbol">$</span>
                  <input
                    type="number"
                    className="explore-price-input"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                  />
                </div>
                <span className="explore-price-sep">to</span>
                <div className="price-input-wrapper">
                  <span className="price-symbol">$</span>
                  <input
                    type="number"
                    className="explore-price-input"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <button className="explore-clear-btn" onClick={handleClearFilters}>
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Main Content */}
          <main className="explore-main-content">
            <div className="explore-results-header">
              {!loading && (
                <p className="explore-results-count">
                  Showing <strong>{services.length}</strong> {services.length === 1 ? 'service' : 'services'}
                </p>
              )}
            </div>

            {error && (
              <div className="explore-error-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
                <button className="explore-retry-btn" onClick={fetchServices}>Retry</button>
              </div>
            )}

            {loading ? (
              <div className="explore-services-grid">
                {Array.from({ length: 8 }).map((_, i) => <ServiceSkeleton key={i} />)}
              </div>
            ) : services.length === 0 ? (
              <div className="explore-empty-state glass">
                <div className="explore-empty-icon">🔍</div>
                <h3>No services found</h3>
                <p>Try adjusting your search or category filters to find what you're looking for.</p>
                {hasActiveFilters && (
                  <button className="explore-btn-primary" onClick={handleClearFilters}>Clear all filters</button>
                )}
              </div>
            ) : (
              <div className="explore-services-grid">
                {services.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Explore;
