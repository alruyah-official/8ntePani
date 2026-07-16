import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';
import './Dashboard.css';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/* ─── Tag Input Component ─────────────────────────────────────────────────── */
function TagInput({ tags, onAdd, onRemove, placeholder, label, inputId }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputValue.trim().replace(/,+$/, '');
      if (val && !tags.includes(val)) {
        onAdd(val);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="tag-input-wrapper">
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="tag-input-box">
        <div className="tag-list" style={{ flex: 1 }}>
          {tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
              <button
                type="button"
                className="tag-remove"
                onClick={() => onRemove(tag)}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            id={inputId}
            type="text"
            className="tag-inline-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
          />
        </div>
      </div>
      <p className="form-hint">Press Enter or comma to add</p>
    </div>
  );
}

/* ─── Service Form Component ──────────────────────────────────────────────── */
function ServiceForm({ initialData, categories, onSuccess, onClose }) {
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    deliveryDays: initialData?.deliveryDays || '',
    categoryId: initialData?.categoryId || '',
  });

  const [images, setImages] = useState(initialData?.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [draggingOver, setDraggingOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const uploadImages = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    const remaining = 5 - images.length;
    if (remaining <= 0) {
      setImageError('Maximum 5 images allowed.');
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploadingImages(true);
    setImageError('');

    try {
      const formData = new FormData();
      toUpload.forEach((f) => formData.append('images', f));
      const res = await api.post('/api/upload/multiple', formData);
      const urls = res.data.data.map((item) => item.secure_url);
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setImageError(err?.response?.data?.message || 'Image upload failed.');
    } finally {
      setUploadingImages(false);
    }
  }, [images]);

  const handleFileChange = (e) => {
    uploadImages(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDraggingOver(false);
    uploadImages(e.dataTransfer.files);
  };

  const removeImage = (url) => {
    setImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim() || form.title.length < 5 || form.title.length > 100) {
      setFormError('Title must be between 5 and 100 characters.');
      return;
    }
    if (!form.description.trim() || form.description.length < 20) {
      setFormError('Description must be at least 20 characters.');
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      setFormError('Price must be greater than 0.');
      return;
    }
    const days = parseInt(form.deliveryDays, 10);
    if (!days || days < 1 || days > 30) {
      setFormError('Delivery days must be between 1 and 30.');
      return;
    }
    if (!form.categoryId) {
      setFormError('Please select a category.');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        deliveryDays: days,
        categoryId: form.categoryId,
        images,
      };

      if (isEdit) {
        await api.put(`/api/services/${initialData.id}`, body);
      } else {
        await api.post('/api/services', body);
      }
      onSuccess(isEdit ? 'Service updated successfully!' : 'Service created successfully!');
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="service-form" noValidate>
      {formError && (
        <div className="error-banner" role="alert">
          <span>⚠</span> {formError}
        </div>
      )}

      {/* Title */}
      <div className="form-group">
        <label className="form-label" htmlFor="svc-title">Title</label>
        <input
          id="svc-title"
          name="title"
          type="text"
          className="form-input"
          placeholder="e.g. I will design a stunning logo"
          value={form.title}
          onChange={handleChange}
          maxLength={100}
          required
        />
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label" htmlFor="svc-desc">Description</label>
        <textarea
          id="svc-desc"
          name="description"
          className="form-textarea"
          placeholder="Describe what you'll deliver in detail (min. 20 characters)"
          value={form.description}
          onChange={handleChange}
          rows={4}
          required
        />
      </div>

      {/* Price & Delivery */}
      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label" htmlFor="svc-price">Price ($)</label>
          <input
            id="svc-price"
            name="price"
            type="number"
            className="form-input"
            placeholder="e.g. 50"
            value={form.price}
            onChange={handleChange}
            min="1"
            step="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="svc-delivery">Delivery Days</label>
          <input
            id="svc-delivery"
            name="deliveryDays"
            type="number"
            className="form-input"
            placeholder="1–30"
            value={form.deliveryDays}
            onChange={handleChange}
            min="1"
            max="30"
            required
          />
        </div>
      </div>

      {/* Category */}
      <div className="form-group">
        <label className="form-label" htmlFor="svc-category">Category</label>
        <select
          id="svc-category"
          name="categoryId"
          className="form-select"
          value={form.categoryId}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Image upload */}
      <div className="form-group">
        <label className="form-label">Images (up to 5)</label>
        <div
          className={`image-drop-zone ${draggingOver ? 'drag-over' : ''} ${uploadingImages ? 'uploading' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
          onDragLeave={() => setDraggingOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploadingImages && images.length < 5 && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          aria-label="Upload images"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {uploadingImages ? (
            <div className="image-drop-content">
              <div className="spinner" style={{ width: 28, height: 28, borderWidth: 2 }} />
              <span>Uploading images…</span>
            </div>
          ) : images.length >= 5 ? (
            <div className="image-drop-content">
              <span className="image-drop-icon">✓</span>
              <span>Maximum 5 images reached</span>
            </div>
          ) : (
            <div className="image-drop-content">
              <span className="image-drop-icon">📁</span>
              <span>Drag & drop or <strong>click to upload</strong></span>
              <span className="image-drop-hint">{images.length}/5 images • JPG, PNG, WEBP</span>
            </div>
          )}
        </div>

        {imageError && (
          <p className="form-error">⚠ {imageError}</p>
        )}

        {images.length > 0 && (
          <div className="image-preview-grid">
            {images.map((url, i) => (
              <div key={url} className="image-preview-item">
                <img src={url} alt={`Preview ${i + 1}`} />
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={() => removeImage(url)}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </button>
        <button
          type="submit"
          className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`}
          disabled={submitting || uploadingImages}
        >
          {submitting ? '' : isEdit ? 'Save Changes' : 'Create Service'}
        </button>
      </div>
    </form>
  );
}

/* ─── My Services Tab ─────────────────────────────────────────────────────── */
function MyServicesTab({ user }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editService, setEditService] = useState(null);

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchServices = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/services/freelancer/${user.id}`);
      setServices(res.data.data.services || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/api/categories');
      setCategories(res.data.data.categories || []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [fetchServices, fetchCategories]);

  const openCreate = () => {
    setEditService(null);
    setModalOpen(true);
  };

  const openEdit = (svc) => {
    setEditService(svc);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditService(null);
  };

  const handleFormSuccess = (msg) => {
    closeModal();
    fetchServices();
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/services/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchServices();
      setSuccessMsg('Service deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete service.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="tab-panel animate-fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">My Services</h2>
          <p className="section-subtitle">Manage the services you offer to clients</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="create-service-btn">
          <span>+</span> New Service
        </button>
      </div>

      {successMsg && (
        <div className="success-banner" role="status">
          <span>✓</span> {successMsg}
        </div>
      )}
      {error && (
        <div className="error-banner" role="alert">
          <span>⚠</span> {error}
        </div>
      )}

      {loading ? (
        <div className="services-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="service-row-skeleton">
              <div className="skeleton" style={{ width: 80, height: 60, borderRadius: 8 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 16, width: '60%' }} />
                <div className="skeleton" style={{ height: 12, width: '30%' }} />
              </div>
              <div className="skeleton" style={{ width: 80, height: 32 }} />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛠️</div>
          <h3>No services yet</h3>
          <p>You haven't listed any services yet. Create your first service to start earning.</p>
          <button className="btn btn-primary btn-lg" onClick={openCreate} id="create-first-service-btn">
            Create your first service
          </button>
        </div>
      ) : (
        <div className="services-list">
          {services.map((svc) => (
            <ServiceRow
              key={svc.id}
              service={svc}
              onEdit={() => openEdit(svc)}
              onDelete={() => setDeleteTarget(svc)}
            />
          ))}
        </div>
      )}

      {/* Service Form Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal service-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
          >
            <div className="modal-header">
              <h3 className="modal-title" id="service-modal-title">
                {editService ? 'Edit Service' : 'Create New Service'}
              </h3>
              <button className="modal-close" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>
            <ServiceForm
              initialData={editService}
              categories={categories}
              onSuccess={handleFormSuccess}
              onClose={closeModal}
            />
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Service"
        message={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ─── Service Row ─────────────────────────────────────────────────────────── */
function ServiceRow({ service, onEdit, onDelete }) {
  const thumbnail = service.images?.[0] || null;
  return (
    <div className="service-row">
      <div className="service-row-thumb">
        {thumbnail ? (
          <img src={thumbnail} alt={service.title} className="service-thumb-img" />
        ) : (
          <div className="service-thumb-placeholder">🖼</div>
        )}
      </div>
      <div className="service-row-info">
        <h4 className="service-row-title">{service.title}</h4>
        <div className="service-row-meta">
          {service.category && (
            <span className="badge badge-primary">{service.category.name}</span>
          )}
          <span className="service-row-price">${Number(service.price).toFixed(2)}</span>
          <span className="service-row-delivery">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: -2 }}>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {service.deliveryDays}d delivery
          </span>
        </div>
      </div>
      <div className="service-row-actions">
        <button className="btn btn-secondary btn-sm" onClick={onEdit} id={`edit-service-${service.id}`}>
          ✏ Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={onDelete} id={`delete-service-${service.id}`}>
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

/* ─── My Profile Tab ──────────────────────────────────────────────────────── */
function MyProfileTab() {
  const [profile, setProfile] = useState(null);
  const [profileExists, setProfileExists] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');

  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [location, setLocation] = useState('');
  const [languages, setLanguages] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError('');
    try {
      const res = await api.get('/api/profile/me');
      const p = res.data.data.profile;
      setProfile(p);
      setProfileExists(true);
      setBio(p.bio || '');
      setSkills(p.skills || []);
      setLocation(p.location || '');
      setLanguages(p.languages || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        setProfileExists(false);
        setProfile(null);
      } else {
        setProfileError(err?.response?.data?.message || 'Failed to load profile.');
      }
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (skills.length === 0) {
      setFormError('Please add at least one skill.');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        bio: bio.trim(),
        skills,
        location: location.trim(),
        languages,
      };

      if (profileExists) {
        await api.put('/api/profile', body);
        setSuccessMsg('Profile updated successfully!');
      } else {
        const res = await api.post('/api/profile', body);
        setProfile(res.data.data.profile);
        setProfileExists(true);
        setSuccessMsg('Profile created successfully!');
      }

      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="loading-page" style={{ minHeight: 300 }}>
        <div className="spinner" />
        <p>Loading profile…</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="tab-panel animate-fade-in">
        <div className="error-banner">
          <span>⚠</span> {profileError}
        </div>
        <button className="btn btn-secondary" onClick={fetchProfile}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="tab-panel animate-fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            {profileExists ? 'Edit Profile' : 'Create Your Profile'}
          </h2>
          <p className="section-subtitle">
            {profileExists
              ? 'Keep your profile up to date to attract more clients'
              : 'Set up your freelancer profile to start receiving work'}
          </p>
        </div>
      </div>

      {!profileExists && (
        <div className="profile-no-profile-notice">
          <span className="profile-notice-icon">👋</span>
          <div>
            <strong>Your profile isn't set up yet.</strong>
            <p>Fill out the form below to create your freelancer profile and become discoverable to clients.</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="success-banner" role="status">
          <span>✓</span> {successMsg}
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="error-banner" role="alert">
            <span>⚠</span> {formError}
          </div>
        )}

        {/* Bio */}
        <div className="form-group">
          <div className="profile-form-label-row">
            <label className="form-label" htmlFor="profile-bio">Bio</label>
            <span className="char-count" aria-live="polite">{bio.length}/500</span>
          </div>
          <textarea
            id="profile-bio"
            className="form-textarea"
            placeholder="Tell clients about yourself, your expertise, and what makes you unique…"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            rows={5}
          />
        </div>

        {/* Skills */}
        <div className="form-group">
          <TagInput
            tags={skills}
            onAdd={(v) => setSkills((prev) => [...prev, v])}
            onRemove={(v) => setSkills((prev) => prev.filter((s) => s !== v))}
            placeholder="Type a skill and press Enter"
            label="Skills (min. 1 required)"
            inputId="profile-skills"
          />
        </div>

        {/* Location */}
        <div className="form-group">
          <label className="form-label" htmlFor="profile-location">Location</label>
          <input
            id="profile-location"
            type="text"
            className="form-input"
            placeholder="e.g. New York, USA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Languages */}
        <div className="form-group">
          <TagInput
            tags={languages}
            onAdd={(v) => setLanguages((prev) => [...prev, v])}
            onRemove={(v) => setLanguages((prev) => prev.filter((l) => l !== v))}
            placeholder="Type a language and press Enter"
            label="Languages"
            inputId="profile-languages"
          />
        </div>

        <div className="profile-form-actions">
          <button
            type="submit"
            className={`btn btn-primary btn-lg ${submitting ? 'btn-loading' : ''}`}
            disabled={submitting}
            id="save-profile-btn"
          >
            {submitting ? '' : profileExists ? 'Save Changes' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Dashboard ───────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('services');
  const [localAvatar, setLocalAvatar] = useState(user?.avatar || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  // Redirect non-freelancers
  useEffect(() => {
    if (user && user.role !== 'FREELANCER') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Sync avatar when user changes
  useEffect(() => {
    if (user?.avatar) setLocalAvatar(user.avatar);
  }, [user?.avatar]);

  if (!user) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  if (user.role !== 'FREELANCER') return null;

  const handleAvatarClick = () => {
    if (!avatarUploading) avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/api/profile/avatar', formData);
      const updatedUser = res.data.data.user;
      setLocalAvatar(updatedUser.avatar);
    } catch (err) {
      setAvatarError(err?.response?.data?.message || 'Avatar upload failed.');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const initials = getInitials(user.name);

  return (
    <div className="dashboard-wrapper animate-fade-in">
      {/* ── Dashboard Header ── */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          {/* Avatar */}
          <div className="avatar-upload-container">
            <div
              className={`avatar-upload-trigger ${avatarUploading ? 'uploading' : ''}`}
              onClick={handleAvatarClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
              aria-label="Upload avatar"
              title="Click to change avatar"
            >
              {localAvatar ? (
                <img
                  src={localAvatar}
                  alt={user.name}
                  className="avatar avatar-2xl dashboard-avatar"
                />
              ) : (
                <div className="avatar-placeholder avatar-2xl dashboard-avatar">
                  <span style={{ fontSize: '2.5rem' }}>{initials}</span>
                </div>
              )}

              {/* Upload overlay */}
              <div className="avatar-overlay">
                {avatarUploading ? (
                  <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
              </div>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
              id="avatar-file-input"
            />
          </div>

          {/* User info */}
          <div className="dashboard-user-info">
            <div className="dashboard-user-name-row">
              <h1 className="dashboard-user-name">{user.name}</h1>
              <span className="badge badge-primary dashboard-role-badge">
                {user.role}
              </span>
            </div>
            <p className="dashboard-user-email">{user.email}</p>
            <p className="dashboard-member-since">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: -2 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Member since {formatDate(user.createdAt)}
            </p>
            {avatarError && (
              <p className="dashboard-avatar-error">⚠ {avatarError}</p>
            )}
          </div>
        </div>

        {/* Header gradient accent */}
        <div className="dashboard-header-glow" aria-hidden="true" />
      </div>

      {/* ── Tab Navigation ── */}
      <div className="dashboard-tabs" role="tablist" aria-label="Dashboard sections">
        <button
          className={`dashboard-tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
          role="tab"
          aria-selected={activeTab === 'services'}
          id="tab-services"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          My Services
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          role="tab"
          aria-selected={activeTab === 'profile'}
          id="tab-profile"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          My Profile
        </button>
      </div>

      {/* ── Tab Content ── */}
      <div className="dashboard-content">
        {activeTab === 'services' && <MyServicesTab user={user} />}
        {activeTab === 'profile' && <MyProfileTab />}
      </div>
    </div>
  );
}
