import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import './Jobs.css';

function JobSkeleton() {
  return (
    <div className="premium-job-card" style={{ height: '240px' }}>
      <div className="skeleton-line" style={{ height: '24px', width: '70%', marginBottom: '8px' }}></div>
      <div className="skeleton-line" style={{ height: '14px', width: '40%', marginBottom: '24px' }}></div>
      <div className="skeleton-line" style={{ height: '16px', width: '100%', marginBottom: '8px' }}></div>
      <div className="skeleton-line" style={{ height: '16px', width: '90%', marginBottom: '24px' }}></div>
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
        <div className="skeleton-line" style={{ height: '24px', width: '24px', borderRadius: '50%' }}></div>
        <div className="skeleton-line" style={{ height: '16px', width: '100px' }}></div>
      </div>
    </div>
  );
}

function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState('');

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setDebouncedSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    api.get('/api/categories')
      .then(res => setCategories(res.data.data.categories))
      .catch(() => {});
  }, []);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCategory) params.categoryId = selectedCategory;
    if (selectedStatus) params.status = selectedStatus;

    const newSearchParams = new URLSearchParams();
    if (debouncedSearch) newSearchParams.set('search', debouncedSearch);
    if (selectedCategory) newSearchParams.set('category', selectedCategory);
    setSearchParams(newSearchParams, { replace: true });

    api.get('/api/jobs', { params })
      .then(res => setJobs(res.data.data.jobs || []))
      .catch(() => setError('Failed to load jobs. Please try again.'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, selectedCategory, selectedStatus, setSearchParams]);

  useEffect(() => {
    fetchJobs();
    
    const handleJobPosted = () => fetchJobs();
    window.addEventListener('jobPosted', handleJobPosted);
    return () => window.removeEventListener('jobPosted', handleJobPosted);
  }, [fetchJobs]);

  return (
    <div className="jobs-page">
      <div className="container">
        
        <header className="jobs-header">
          <h1 className="jobs-title">Freelance Jobs Board</h1>
          <p className="jobs-subtitle">
            Find exactly what you're looking for, or post a new job in seconds.
          </p>

          <div className="jobs-search-wrapper">
            <div className="jobs-search-group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="jobs-search-input"
                placeholder="Search jobs by title, skill, or keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="post-job-modal-close" onClick={() => setSearch('')} style={{ marginRight: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="jobs-layout">
          {/* Sidebar */}
          <aside className="jobs-sidebar">
            <div className="jobs-sidebar-section">
              <h3 className="jobs-sidebar-title">Categories</h3>
              <div className="jobs-category-list">
                <button
                  className={`jobs-category-item ${selectedCategory === '' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('')}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`jobs-category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(prev => prev === cat.id ? '' : cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="jobs-sidebar-section">
              <h3 className="jobs-sidebar-title">Status</h3>
              <div className="jobs-category-list">
                <button className={`jobs-category-item ${selectedStatus === '' ? 'active' : ''}`} onClick={() => setSelectedStatus('')}>
                  All Statuses
                </button>
                <button className={`jobs-category-item ${selectedStatus === 'OPEN' ? 'active' : ''}`} onClick={() => setSelectedStatus('OPEN')}>
                  <span>🟢 Open</span>
                </button>
                <button className={`jobs-category-item ${selectedStatus === 'IN_PROGRESS' ? 'active' : ''}`} onClick={() => setSelectedStatus('IN_PROGRESS')}>
                  <span>🟡 In Progress</span>
                </button>
                <button className={`jobs-category-item ${selectedStatus === 'COMPLETED' ? 'active' : ''}`} onClick={() => setSelectedStatus('COMPLETED')}>
                  <span>⚫ Completed</span>
                </button>
              </div>
            </div>
            
            {(debouncedSearch || selectedCategory || selectedStatus) && (
              <button className="btn btn-ghost btn-full" onClick={() => {
                setSearch(''); setDebouncedSearch(''); setSelectedCategory(''); setSelectedStatus('');
                setSearchParams(new URLSearchParams());
              }}>
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Main Content */}
          <main>
            <div className="jobs-grid-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Available Jobs</h2>
              {!loading && (
                <span className="jobs-count">{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found</span>
              )}
            </div>

            {error && (
              <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
                {error}
                <button className="btn-sm" onClick={fetchJobs} style={{ marginLeft: '1rem' }}>Retry</button>
              </div>
            )}

            {loading ? (
              <div className="jobs-grid">
                {Array.from({ length: 6 }).map((_, i) => <JobSkeleton key={i} />)}
              </div>
            ) : jobs.length === 0 && !error ? (
              <div className="empty-state">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <h3>No jobs found</h3>
                <p>Try adjusting your search or category filters to find what you're looking for.</p>
              </div>
            ) : !error ? (
              <div className="jobs-grid">
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Jobs;
