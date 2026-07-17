import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import './Jobs.css';

// Reusing the skeleton from Home/Explore for consistency
function JobSkeleton() {
  return (
    <div className="service-card skeleton-card" style={{ height: '320px', borderRadius: '16px' }}>
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

function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters from URL if they exist
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Update state when URL params change
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

  // Fetch jobs (Mocking by fetching services and mapping them as jobs for now)
  const fetchJobs = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCategory) params.categoryId = selectedCategory;
    if (selectedStatus) params.status = selectedStatus;

    // Update URL with current filters to make shareable
    const newSearchParams = new URLSearchParams();
    if (debouncedSearch) newSearchParams.set('search', debouncedSearch);
    if (selectedCategory) newSearchParams.set('category', selectedCategory);
    setSearchParams(newSearchParams, { replace: true });

    api.get('/api/jobs', { params })
      .then(res => {
        setJobs(res.data.data.jobs || []);
      })
      .catch(() => setError('Failed to load jobs. Please try again.'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, selectedCategory, selectedStatus, setSearchParams]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(prev => prev === categoryId ? '' : categoryId);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = debouncedSearch || selectedCategory || selectedStatus;

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPostForm, setShowPostForm] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '', description: '', categoryId: '', budget: ''
  });
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState(null);
  const [postSuccess, setPostSuccess] = useState(null);

  const handlePostButtonClick = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user.role === 'FREELANCER') {
      alert('Only clients can post jobs. Please register as a client.');
      return;
    }
    setShowPostForm(true);
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPostLoading(true);
    setPostError(null);
    try {
      const data = {
        title: jobForm.title,
        description: jobForm.description,
        categoryId: jobForm.categoryId,
      };
      if (jobForm.budget) data.budget = Number(jobForm.budget);
      const res = await api.post('/api/jobs', data);
      setJobs(prev => [res.data.data.job, ...prev]);
      setPostSuccess('Job posted successfully!');
      setJobForm({ title: '', description: '', categoryId: '', budget: '' });
      setShowPostForm(false);
      setTimeout(() => setPostSuccess(null), 3000);
    } catch (err) {
      setPostError(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <div className="explore-page jobs-page">
      <div className="container">
        
        <div className="explore-header">
          <h1 className="explore-title text-gradient">Find Freelance Jobs</h1>
          <p className="explore-subtitle">
            Browse projects posted by clients and submit your proposals.
          </p>
          
          <div className="explore-search-wrapper">
            <div className="explore-search-group glass">
              <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="explore-search-input"
                placeholder="What kind of job are you looking for?"
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
          <div style={{ marginTop: '1rem' }}>
            <button
              className="explore-btn-primary"
              onClick={handlePostButtonClick}
            >
              + Post a Job
            </button>
          </div>
        </div>

        {showPostForm && (
          <div className="card" style={{
            maxWidth: '700px', margin: '1.5rem auto',
            padding: '2rem', background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Post a New Job</h2>
            {postError && (
              <div style={{
                background: '#fee2e2', border: '1px solid #ef4444',
                color: '#991b1b', padding: '0.75rem',
                borderRadius: '4px', marginBottom: '1rem'
              }}>{postError}</div>
            )}
            {postSuccess && (
              <div style={{
                background: '#d1fae5', border: '1px solid #10b981',
                color: '#065f46', padding: '0.75rem',
                borderRadius: '4px', marginBottom: '1rem'
              }}>{postSuccess}</div>
            )}
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                placeholder="e.g. Need a logo for my startup"
                value={jobForm.title}
                onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={jobForm.categoryId}
                onChange={e => setJobForm(p => ({ ...p, categoryId: e.target.value }))}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Job Description</label>
              <textarea
                rows={5}
                placeholder="Describe what you need in detail..."
                value={jobForm.description}
                onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', width: '100%' }}
              />
            </div>
            <div className="form-group">
              <label>Budget (₹) — Optional</label>
              <input
                type="number"
                min="1"
                placeholder="Leave empty if negotiable"
                value={jobForm.budget}
                onChange={e => setJobForm(p => ({ ...p, budget: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={handlePostJob}
                disabled={postLoading}
              >
                {postLoading ? 'Posting...' : 'Post Job'}
              </button>
              <button
                className="btn"
                style={{ background: '#e5e7eb' }}
                onClick={() => setShowPostForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
              <h3 className="explore-sidebar-title">Status</h3>
              <div className="explore-category-list">
                <button
                  className={`explore-category-item ${selectedStatus === '' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('')}
                >
                  All Jobs
                </button>
                <button
                  className={`explore-category-item ${selectedStatus === 'OPEN' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('OPEN')}
                >
                  🟢 Open
                </button>
                <button
                  className={`explore-category-item ${selectedStatus === 'IN_PROGRESS' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('IN_PROGRESS')}
                >
                  🟡 In Progress
                </button>
                <button
                  className={`explore-category-item ${selectedStatus === 'COMPLETED' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('COMPLETED')}
                >
                  ⚫ Completed
                </button>
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
                  Showing <strong>{jobs.length}</strong> {jobs.length === 1 ? 'job' : 'jobs'}
                </p>
              )}
            </div>

            {error && (
              <div className="explore-error-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
                <button className="explore-retry-btn" onClick={fetchJobs}>Retry</button>
              </div>
            )}

            {loading ? (
              <div className="explore-services-grid">
                {Array.from({ length: 8 }).map((_, i) => <JobSkeleton key={i} />)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="explore-empty-state glass">
                <div className="explore-empty-icon">🔍</div>
                <h3>No jobs found</h3>
                <p>Try adjusting your search or category filters to find what you're looking for.</p>
                {hasActiveFilters && (
                  <button className="explore-btn-primary" onClick={handleClearFilters}>Clear all filters</button>
                )}
              </div>
            ) : (
              <div className="explore-services-grid">
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Jobs;
