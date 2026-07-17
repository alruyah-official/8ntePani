import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './PostJobModal.css';

function PostJobModal({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [jobForm, setJobForm] = useState({ title: '', description: '', categoryId: '', budget: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/categories')
      .then(res => setCategories(res.data.data.categories))
      .catch(() => {});
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        title: jobForm.title,
        description: jobForm.description,
        categoryId: jobForm.categoryId,
      };
      if (jobForm.budget) data.budget = Number(jobForm.budget);
      
      await api.post('/api/jobs', data);
      setSuccess('Job posted successfully!');
      
      // Notify other components (like Jobs.jsx) to refresh
      window.dispatchEvent(new Event('jobPosted'));
      
      setTimeout(() => {
        onClose();
        navigate('/jobs'); // Optionally navigate to jobs
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="post-job-modal">
        <div className="post-job-modal-header">
          <h2>Post a New Job</h2>
          <button className="post-job-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <div className="post-job-modal-body">
          {error && (
            <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>
          )}
          {success && (
            <div className="success-banner" style={{ marginBottom: '1rem' }}>{success}</div>
          )}
          
          <div className="form-group">
            <label className="form-label">Job Title <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Need a logo for my startup"
              value={jobForm.title}
              onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Category <span style={{ color: 'red' }}>*</span></label>
            <select
              className="form-select"
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
            <label className="form-label">Budget (₹) <span style={{ color: 'var(--color-text-faint)', fontWeight: 400 }}>(Optional)</span></label>
            <input
              type="number"
              min="1"
              className="form-input"
              placeholder="Leave empty if negotiable"
              value={jobForm.budget}
              onChange={e => setJobForm(p => ({ ...p, budget: e.target.value }))}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Job Description <span style={{ color: 'red' }}>*</span></label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Describe what you need in detail..."
              value={jobForm.description}
              onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>

        <div className="post-job-modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handlePostJob} disabled={loading || !jobForm.title || !jobForm.description || !jobForm.categoryId}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostJobModal;
