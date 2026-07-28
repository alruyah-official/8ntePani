import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/pages/Dashboard.css';

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

/* ─── Category Dropdown Component ────────────────────────────────────────── */
function CategoryDropdown({ categories, value, onChange, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const uid = useId();
  const listId = `cat-list-${uid}`;

  // Build flat option list for keyboard navigation
  // Structure: [ {type:'placeholder'}, {type:'option', cat}, ..., {type:'add'} ]
  const flatOptions = [
    { type: 'placeholder', id: '', label: '— Select a category —' },
    ...categories.map((cat) => ({ type: 'option', id: cat.id, label: cat.name })),
    { type: 'add', id: '__other__', label: 'Add a new category…' },
  ];

  const selectedCat = categories.find((c) => c.id === value);
  const triggerLabel = selectedCat
    ? selectedCat.name
    : value === '__other__'
    ? 'Add a new category…'
    : '— Select a category —';
  const hasValue = !!selectedCat;

  // Close on outside click / focus loss
  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !listRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (!isOpen || activeIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[role="option"]');
    items[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  const openDropdown = () => {
    setIsOpen(true);
    // Pre-select active index from current value
    const idx = flatOptions.findIndex((o) => o.id === (value || ''));
    setActiveIndex(idx >= 0 ? idx : 0);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setActiveIndex(-1);
    triggerRef.current?.focus();
  };

  const selectOption = (opt) => {
    onChange({ target: { value: opt.id } });
    setIsOpen(false);
    setActiveIndex(-1);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else if (e.key === 'ArrowDown') {
          setActiveIndex((i) => Math.min(i + 1, flatOptions.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Escape':
      case 'Tab':
        if (isOpen) {
          e.key === 'Escape' && e.preventDefault();
          closeDropdown();
        }
        break;
      default:
        break;
    }
  };

  const handleListKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) selectOption(flatOptions[activeIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'Tab':
        closeDropdown();
        break;
      default:
        break;
    }
  };

  return (
    <div className="cat-dropdown">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        id={`cat-trigger-${uid}`}
        className={`cat-dropdown__trigger${
          isOpen ? ' cat-dropdown__trigger--open' : ''
        }${hasValue ? ' cat-dropdown__trigger--has-value' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-required={required}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={`cat-dropdown__trigger-text${!hasValue && value !== '__other__' ? ' cat-dropdown__trigger-text--placeholder' : ''}`}>
          {triggerLabel}
        </span>
        <svg
          className="cat-dropdown__chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={`cat-trigger-${uid}`}
          className="cat-dropdown__panel"
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
        >
          {/* Section: placeholder */}
          <div
            role="option"
            aria-selected={value === ''}
            className={`cat-dropdown__option cat-dropdown__option--placeholder${
              activeIndex === 0 ? ' cat-dropdown__option--active' : ''
            }`}
            onClick={() => selectOption(flatOptions[0])}
            onMouseEnter={() => setActiveIndex(0)}
            data-value=""
          >
            <span>— Select a category —</span>
          </div>

          {/* Section: Available Categories */}
          {categories.length > 0 && (
            <>
              <div className="cat-dropdown__section-heading" aria-hidden="true">
                <span>Available Categories</span>
              </div>
              {categories.map((cat, i) => {
                const optIndex = i + 1; // offset by placeholder
                return (
                  <div
                    key={cat.id}
                    role="option"
                    aria-selected={value === cat.id}
                    className={`cat-dropdown__option${
                      value === cat.id ? ' cat-dropdown__option--selected' : ''
                    }${activeIndex === optIndex ? ' cat-dropdown__option--active' : ''}`}
                    onClick={() => selectOption({ id: cat.id, label: cat.name })}
                    onMouseEnter={() => setActiveIndex(optIndex)}
                    data-value={cat.id}
                  >
                    {value === cat.id && (
                      <svg
                        className="cat-dropdown__check"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <span className="cat-dropdown__option-label">{cat.name}</span>
                  </div>
                );
              })}
            </>
          )}

          {/* Section: Add new */}
          <div className="cat-dropdown__section-heading cat-dropdown__section-heading--add" aria-hidden="true">
            <span>Can't find yours?</span>
          </div>
          <div
            role="option"
            aria-selected={value === '__other__'}
            className={`cat-dropdown__option cat-dropdown__option--add${
              value === '__other__' ? ' cat-dropdown__option--selected' : ''
            }${activeIndex === flatOptions.length - 1 ? ' cat-dropdown__option--active' : ''}`}
            onClick={() => selectOption(flatOptions[flatOptions.length - 1])}
            onMouseEnter={() => setActiveIndex(flatOptions.length - 1)}
            data-value="__other__"
          >
            <svg
              className="cat-dropdown__add-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="cat-dropdown__option-label">Add a new category…</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Service Form Component (Inside Modal) ───────────────────────────────── */
function ServiceForm({ initialData, categories, onSuccess, onClose }) {
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    deliveryDays: initialData?.deliveryDays || '',
    categoryId: initialData?.categoryId || '',
    experienceLevel: initialData?.experienceLevel || 'INTERMEDIATE',
  });

  const [images, setImages] = useState(initialData?.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [draggingOver, setDraggingOver] = useState(false);
  const fileInputRef = useRef(null);

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryLoading, setCustomCategoryLoading] = useState(false);
  const [customCategoryError, setCustomCategoryError] = useState('');
  const [allCategories, setAllCategories] = useState(categories);

  useEffect(() => {
    setAllCategories(categories);
  }, [categories]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === '__other__') {
      setIsCustomCategory(true);
      setForm(prev => ({ ...prev, categoryId: '' }));
    } else {
      setIsCustomCategory(false);
      setCustomCategoryName('');
      setCustomCategoryError('');
      setForm(prev => ({ ...prev, categoryId: val }));
    }
  };

  const handleCreateCategory = async () => {
    if (!customCategoryName.trim()) {
      setCustomCategoryError('Please enter a category name.');
      return;
    }
    const slug = customCategoryName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    setCustomCategoryLoading(true);
    setCustomCategoryError('');
    try {
      const res = await api.post('/api/categories', {
        name: customCategoryName.trim(),
        slug,
      });
      const newCat = res.data.data.category;
      setAllCategories(prev => [...prev, newCat]);
      setForm(prev => ({ ...prev, categoryId: newCat.id }));
      setIsCustomCategory(false);
      setCustomCategoryName('');
    } catch (err) {
      setCustomCategoryError(
        err?.response?.data?.message || 
        'Failed to create category. It may already exist.'
      );
    } finally {
      setCustomCategoryLoading(false);
    }
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
        experienceLevel: form.experienceLevel,
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

      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label">
            Category
          </label>
          <CategoryDropdown
            categories={allCategories}
            value={isCustomCategory ? '__other__' : form.categoryId}
            onChange={handleCategoryChange}
            required
          />

          {isCustomCategory && (
            <div className="custom-category-panel">
              <p className="custom-category-heading">Create a new category</p>
              <div className="custom-category-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 3D Modeling"
                  value={customCategoryName}
                  onChange={e => {
                    setCustomCategoryName(e.target.value);
                    setCustomCategoryError('');
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleCreateCategory}
                  disabled={customCategoryLoading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {customCategoryLoading ? '…' : 'Add'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setIsCustomCategory(false);
                    setCustomCategoryName('');
                    setCustomCategoryError('');
                  }}
                  aria-label="Cancel"
                >
                  ✕
                </button>
              </div>
              {customCategoryError && (
                <p className="form-error" style={{ marginTop: 'var(--space-2)' }}>
                  ⚠ {customCategoryError}
                </p>
              )}
              <p className="custom-category-hint">
                Available to all freelancers once created.
              </p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" id="svc-experience-label">
            Experience Level
          </label>
          <div
            className="experience-level-group"
            role="group"
            aria-labelledby="svc-experience-label"
          >
            {[
              { value: 'BEGINNER',     label: 'Beginner',     icon: '🌱' },
              { value: 'INTERMEDIATE', label: 'Intermediate', icon: '⚡' },
              { value: 'EXPERT',       label: 'Expert',       icon: '🏆' },
            ].map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                className={`experience-level-option${form.experienceLevel === value ? ' experience-level-option--active' : ''} experience-level-option--${value.toLowerCase()}`}
                onClick={() => setForm(prev => ({ ...prev, experienceLevel: value }))}
                aria-pressed={form.experienceLevel === value}
              >
                <span className="experience-level-icon">{icon}</span>
                <span className="experience-level-label">{label}</span>
              </button>
            ))}
          </div>
          <p className="experience-level-hint">
            {form.experienceLevel === 'BEGINNER'     && 'New to this skill, building experience'}
            {form.experienceLevel === 'INTERMEDIATE' && 'Comfortable with most tasks in this area'}
            {form.experienceLevel === 'EXPERT'       && 'Deep expertise and proven track record'}
          </p>
        </div>
      </div>


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

        {imageError && <p className="form-error">⚠ {imageError}</p>}

        {images.length > 0 && (
          <div className="image-preview-grid">
            {images.map((url, i) => (
              <div key={url} className="image-preview-item">
                <img src={url} alt={`Preview ${i + 1}`} />
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={() => removeImage(url)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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

/* ─── Overview Tab (Mock Analytics) ───────────────────────────────────────── */
function OverviewTab({ user, orders, ordersLoading }) {
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchServices = async () => {
      try {
        const res = await api.get(`/api/services/freelancer/${user.id}`);
        setServices(res.data.data.services || []);
      } catch (err) {}
      finally { setServicesLoading(false); }
    };
    fetchServices();
  }, [user?.id]);

  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const activeOrders = orders.filter(o => o.status === 'ACTIVE');
  const totalEarnings = completedOrders.reduce(
    (sum, o) => sum + parseFloat(o.price || 0), 0
  );

  return (
    <div className="animate-fade-in">
      <div className="tab-header">
        <h2 className="tab-title">Overview</h2>
        <p className="tab-subtitle">
          Here's what's happening with your freelancing activity.
        </p>
      </div>

      <div className="analytics-grid">
        
        <div className="stat-card green">
          <span className="stat-title">Active Services</span>
          <span className="stat-value">
            {servicesLoading ? '—' : services.length}
          </span>
          <div className="stat-change neutral">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {services.length === 0 
              ? 'No services listed yet' 
              : `${services.length} service${services.length > 1 ? 's' : ''} listed`}
          </div>
        </div>

        <div className="stat-card purple">
          <span className="stat-title">Completed Orders</span>
          <span className="stat-value">
            {ordersLoading ? '—' : completedOrders.length}
          </span>
          <div className="stat-change positive">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {completedOrders.length === 0 
              ? 'No completed orders yet' 
              : `${completedOrders.length} job${completedOrders.length > 1 ? 's' : ''} completed`}
          </div>
        </div>

        <div className="stat-card orange">
          <span className="stat-title">Total Earnings</span>
          <span className="stat-value">
            {ordersLoading ? '—' : `₹${totalEarnings.toLocaleString()}`}
          </span>
          <div className="stat-change neutral">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            From {completedOrders.length} completed order{completedOrders.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="stat-card" style={{ '--accent': '#3b82f6' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: '4px', height: '100%',
            background: '#3b82f6', borderRadius: '4px 0 0 4px'
          }} />
          <span className="stat-title">Pending Orders</span>
          <span className="stat-value">
            {ordersLoading ? '—' : pendingOrders.length}
          </span>
          <div className="stat-change" style={{ 
            color: pendingOrders.length > 0 ? '#f59e0b' : '#64748b' 
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {pendingOrders.length > 0 
              ? `${pendingOrders.length} awaiting your response` 
              : 'No pending orders'}
          </div>
        </div>

      </div>

      {activeOrders.length > 0 && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>⚡</span>
          <div>
            <p style={{ fontWeight: '700', color: '#1e40af', fontSize: '0.95rem' }}>
              {activeOrders.length} order{activeOrders.length > 1 ? 's' : ''} in progress
            </p>
            <p style={{ fontSize: '0.8rem', color: '#3b82f6' }}>
              You have active work to complete and deliver
            </p>
          </div>
        </div>
      )}

      <div className="activity-section">
        <h3 className="activity-title">Recent Activity</h3>
        <div className="activity-list">
          {ordersLoading ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Loading activity...
            </p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
              <p style={{ fontWeight: '600' }}>No activity yet</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Your orders and activity will appear here
              </p>
            </div>
          ) : (
            orders.slice(0, 5).map(order => {
              const iconMap = {
                PENDING: {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                    </svg>
                  ),
                  color: '#fef3c7',
                  text: `New order from ${order.client?.name} for "${order.service?.title}"`
                },
                ACTIVE: {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  ),
                  color: '#dbeafe',
                  text: `Order accepted — "${order.service?.title}" is in progress`
                },
                DELIVERED: {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  ),
                  color: '#ede9fe',
                  text: `You delivered "${order.service?.title}" — waiting for approval`
                },
                COMPLETED: {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  ),
                  color: '#d1fae5',
                  text: `"${order.service?.title}" completed — ₹${parseFloat(order.price).toLocaleString()} earned`
                },
                REJECTED: {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  ),
                  color: '#fee2e2',
                  text: `You rejected an order for "${order.service?.title}"`
                },
                CANCELLED: {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                  ),
                  color: '#f1f5f9',
                  text: `Order cancelled for "${order.service?.title}"`
                },
              };

              const config = iconMap[order.status] || iconMap.PENDING;

              return (
                <div key={order.id} className="activity-item">
                  <div
                    className="activity-icon"
                    style={{ background: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">
                      {config.text}
                    </p>
                    <p className="activity-time">
                      {new Date(order.updatedAt || order.createdAt)
                        .toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── My Services Tab ─────────────────────────────────────────────────────── */
function MyServicesTab({ user }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editService, setEditService] = useState(null);
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
    <div className="animate-fade-in">
      <div className="services-header-actions">
        <div className="tab-header" style={{ marginBottom: 0 }}>
          <h2 className="tab-title">My Services</h2>
          <p className="tab-subtitle">Manage the services you offer to clients</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <span>+</span> Create Service
        </button>
      </div>

      {successMsg && (
        <div className="success-banner" style={{ marginBottom: 'var(--space-6)' }}>
          <span>✓</span> {successMsg}
        </div>
      )}
      {error && (
        <div className="error-banner" style={{ marginBottom: 'var(--space-6)' }}>
          <span>⚠</span> {error}
        </div>
      )}

      {loading ? (
        <div className="services-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="dash-service-card" style={{ height: 320 }}>
              <div className="skeleton" style={{ height: 160, width: '100%' }} />
              <div className="dash-service-body">
                <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛠️</div>
          <h3>No services yet</h3>
          <p>You haven't listed any services yet. Create your first service to start earning.</p>
          <button className="btn btn-primary btn-lg" onClick={openCreate}>
            Create your first service
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {services.map((svc) => (
            <div className="dash-service-card" key={svc.id}>
              <div className="dash-service-thumb">
                {svc.category && (
                  <span className="dash-service-category">{svc.category.name}</span>
                )}
                {svc.images?.[0] ? (
                  <img src={svc.images[0]} alt={svc.title} />
                ) : (
                  <div className="dash-service-thumb-placeholder">🖼</div>
                )}
              </div>
              <div className="dash-service-body">
                <h4 className="dash-service-title">{svc.title}</h4>
                <div className="dash-service-footer">
                  <span className="dash-service-price">${Number(svc.price).toFixed(2)}</span>
                  <div className="dash-service-actions">
                    <button className="dash-action-btn dash-btn-edit" title="Edit" onClick={() => openEdit(svc)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button className="dash-action-btn dash-btn-delete" title="Delete" onClick={() => setDeleteTarget(svc)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Form Modal */}
      {modalOpen && createPortal(
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal service-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editService ? 'Edit Service' : 'Create New Service'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <ServiceForm
              initialData={editService}
              categories={categories}
              onSuccess={handleFormSuccess}
              onClose={closeModal}
            />
          </div>
        </div>,
        document.body
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

/* ─── My Profile Tab ──────────────────────────────────────────────────────── */
function MyProfileTab({ localAvatar, handleAvatarChange, avatarUploading, avatarError, avatarInputRef, handleAvatarClick }) {
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
      const body = { bio: bio.trim(), skills, location: location.trim(), languages };
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
      <div className="animate-fade-in">
        <div className="error-banner"><span>⚠</span> {profileError}</div>
        <button className="btn btn-secondary" onClick={fetchProfile}>Retry</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="tab-header">
        <h2 className="tab-title">{profileExists ? 'Edit Profile' : 'Create Your Profile'}</h2>
        <p className="tab-subtitle">
          {profileExists ? 'Keep your profile up to date to attract more clients' : 'Set up your freelancer profile to start receiving work'}
        </p>
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
        <div className="success-banner" style={{ marginBottom: 'var(--space-6)' }}>
          <span>✓</span> {successMsg}
        </div>
      )}
      {formError && (
        <div className="error-banner" style={{ marginBottom: 'var(--space-6)' }}>
          <span>⚠</span> {formError}
        </div>
      )}
      {avatarError && (
        <div className="error-banner" style={{ marginBottom: 'var(--space-6)' }}>
          <span>⚠</span> {avatarError}
        </div>
      )}

      <form className="profile-cards-container" onSubmit={handleSubmit} noValidate>
        
        {/* Basic Info Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Basic Information</h3>
            <p className="profile-card-subtitle">Your avatar and biography</p>
          </div>
          
          <div className="avatar-edit-section">
            <div
              className={`avatar-upload-trigger ${avatarUploading ? 'uploading' : ''}`}
              onClick={handleAvatarClick}
            >
              {localAvatar ? (
                <img src={localAvatar} alt="Avatar" className="profile-edit-avatar" />
              ) : (
                <div className="profile-edit-avatar sidebar-avatar-placeholder" style={{ width: '100%', height: '100%' }}>
                  +
                </div>
              )}
              <div className="avatar-overlay">
                {avatarUploading ? (
                  <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                )}
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>
            <div className="avatar-edit-info">
              <h4>Profile Picture</h4>
              <p>JPG, PNG or WEBP. Max size of 5MB.</p>
            </div>
          </div>

          <div className="form-group">
            <div className="profile-form-label-row">
              <label className="form-label" htmlFor="profile-bio">Bio</label>
              <span className="char-count">{bio.length}/500</span>
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
        </div>

        {/* Skills & Expertise */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Skills & Expertise</h3>
            <p className="profile-card-subtitle">Highlight your core strengths</p>
          </div>
          <div className="form-group">
            <TagInput
              tags={skills}
              onAdd={(v) => setSkills((prev) => [...prev, v])}
              onRemove={(v) => setSkills((prev) => prev.filter((s) => s !== v))}
              placeholder="Type a skill and press Enter"
              inputId="profile-skills"
            />
          </div>
        </div>

        {/* Location & Languages */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Location & Languages</h3>
            <p className="profile-card-subtitle">Where are you based and what do you speak?</p>
          </div>
          <div className="form-row-2">
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
          </div>
        </div>

        <div className="profile-form-actions">
          <button type="submit" className={`btn btn-primary btn-lg ${submitting ? 'btn-loading' : ''}`} disabled={submitting}>
            {submitting ? '' : profileExists ? 'Save Profile Changes' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Dashboard Main ──────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // Default tab
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Avatar states for sidebar and passing down to MyProfileTab
  const [localAvatar, setLocalAvatar] = useState(user?.avatar || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/api/orders/my-orders');
      setOrders(res.data.data.orders || []);
    } catch (err) {}
    finally { setOrdersLoading(false); }
  };

  useEffect(() => {
    if (user && user.role !== 'FREELANCER') navigate('/', { replace: true });
    else if (user) fetchOrders();
  }, [user, navigate]);

  useEffect(() => {
    if (user?.avatar) setLocalAvatar(user.avatar);
  }, [user?.avatar]);

  if (!user || user.role !== 'FREELANCER') {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

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
      setLocalAvatar(res.data.data.user.avatar);
    } catch (err) {
      setAvatarError(err?.response?.data?.message || 'Avatar upload failed.');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const initials = getInitials(user.name);

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar Navigation ── */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-user-block">
          {localAvatar ? (
            <img src={localAvatar} alt={user.name} className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar-placeholder">{initials}</div>
          )}
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name}</span>
            <span className="sidebar-user-role">{user.role}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Overview
          </button>
          
          <button 
            className={`sidebar-link ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            My Services
          </button>
          
          <button 
            className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Orders
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Edit Profile
          </button>
          
          <Link to={`/profile/${user.id}`} className="sidebar-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            View Public Profile
          </Link>
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="dashboard-main">
        {activeTab === 'overview' && (
          <OverviewTab 
            user={user} 
            orders={orders} 
            ordersLoading={ordersLoading} 
          />
        )}
        {activeTab === 'services' && <MyServicesTab user={user} />}
        {activeTab === 'orders' && (
          <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1.5rem'
            }}>
              <h2>Incoming Orders ({orders.length})</h2>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/orders')}
              >
                View All Orders
              </button>
            </div>

            {ordersLoading ? (
              <p style={{ color: '#6b7280' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <p style={{ fontSize: '2rem' }}>📦</p>
                <p>No orders yet</p>
                <p style={{ fontSize: '0.875rem' }}>
                  Orders will appear here when clients hire you
                </p>
              </div>
            ) : (
              orders.slice(0, 5).map(order => (
                <div key={order.id} style={{
                  background: 'white', borderRadius: '10px',
                  padding: '1.25rem', marginBottom: '1rem',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: '1rem',
                  borderLeft: `4px solid ${
                    order.status === 'PENDING' ? '#f59e0b' :
                    order.status === 'ACTIVE' ? '#3b82f6' :
                    order.status === 'DELIVERED' ? '#8b5cf6' :
                    order.status === 'COMPLETED' ? '#10b981' :
                    '#ef4444'
                  }`
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '700', color: '#1e293b' }}>
                      {order.service?.title}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      From: {order.client?.name} • 
                      ₹{parseFloat(order.price).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem', fontWeight: '700',
                      background: order.status === 'PENDING' ? '#fef3c7' :
                        order.status === 'ACTIVE' ? '#dbeafe' :
                        order.status === 'DELIVERED' ? '#ede9fe' :
                        order.status === 'COMPLETED' ? '#d1fae5' :
                        '#fee2e2',
                      color: order.status === 'PENDING' ? '#92400e' :
                        order.status === 'ACTIVE' ? '#1e40af' :
                        order.status === 'DELIVERED' ? '#6d28d9' :
                        order.status === 'COMPLETED' ? '#065f46' :
                        '#991b1b'
                    }}>
                      {order.status}
                    </span>
                    <button
                      className="btn"
                      style={{ background: '#f3f4f6', fontSize: '0.875rem' }}
                      onClick={() => navigate('/orders')}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === 'profile' && (
          <MyProfileTab
            localAvatar={localAvatar}
            handleAvatarChange={handleAvatarChange}
            avatarUploading={avatarUploading}
            avatarError={avatarError}
            avatarInputRef={avatarInputRef}
            handleAvatarClick={handleAvatarClick}
          />
        )}
      </main>
    </div>
  );
}
