import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, Plus, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui';
import { gigsApi } from '../api/gigs';
import apiClient from '../api/client';

const STEPS = ['Overview', 'Pricing', 'Description & FAQ', 'Gallery'];
const CATEGORIES = ['Design', 'Development', 'Marketing', 'Video', 'Writing', 'Music', 'Business', 'AI'];

export default function CreateGig() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    tags: [],
    packages: [
      { type: 'Basic', name: '', desc: '', price: '', delivery: '', revisions: '', features: '' },
      { type: 'Standard', name: '', desc: '', price: '', delivery: '', revisions: '', features: '' },
      { type: 'Premium', name: '', desc: '', price: '', delivery: '', revisions: '', features: '' }
    ],
    description: '',
    faqs: [],
    images: []
  });

  // Step 1 Handlers
  const handleTagAdd = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 5) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
        setTagInput('');
      }
    }
  };
  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  // Step 2 Handlers
  const handlePackageChange = (idx, field, value) => {
    const updated = [...formData.packages];
    updated[idx][field] = value;
    setFormData({ ...formData, packages: updated });
  };

  // Step 3 Handlers
  const addFAQ = () => setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] });
  const updateFAQ = (idx, field, val) => {
    const updated = [...formData.faqs];
    updated[idx][field] = val;
    setFormData({ ...formData, faqs: updated });
  };
  const removeFAQ = (idx) => {
    const updated = [...formData.faqs];
    updated.splice(idx, 1);
    setFormData({ ...formData, faqs: updated });
  };

  // Step 4 Handlers
  const fileInputRef = useRef(null);
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Simulate frontend previewing. Ideally you append to FormData and POST to /api/upload
    const newImages = files.map(file => URL.createObjectURL(file));
    setFormData({ ...formData, images: [...formData.images, ...newImages].slice(0, 5) });
  };
  const removeImage = (idx) => {
    const updated = [...formData.images];
    updated.splice(idx, 1);
    setFormData({ ...formData, images: updated });
  };

  // Validation
  const validateStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.title || formData.title.length < 15) return setError('Title must be at least 15 characters.');
      if (!formData.category) return setError('Please select a category.');
      if (formData.tags.length === 0) return setError('Add at least one search tag.');
    }
    if (currentStep === 2) {
      const basic = formData.packages[0];
      if (!basic.name || !basic.price || !basic.delivery) return setError('Basic package fields (Name, Price, Delivery) are required.');
    }
    if (currentStep === 3) {
      if (!formData.description || formData.description.length < 100) return setError('Description must be at least 100 characters.');
    }
    if (currentStep === 4) {
      if (formData.images.length === 0) return setError('Please upload at least one image.');
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setCurrentStep(p => p + 1); };
  const prevStep = () => { setError(''); setCurrentStep(p => p - 1); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    try {
      await gigsApi.createGig(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish gig. Please check your backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      
      {/* Header & Progress */}
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold mb-8">Create a new gig</h1>
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10 rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-300" style={{ width: `${((currentStep - 1) / 3) * 100}%` }} />
          </div>
          
          {STEPS.map((stepName, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            
            return (
              <div key={stepName} className="flex flex-col items-center gap-2 bg-primary px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                  isCompleted ? 'bg-accent border-accent text-primary' : 
                  isActive ? 'bg-surface border-accent text-accent' : 'bg-surface border-border text-muted'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                </div>
                <span className={`text-xs font-bold ${isActive ? 'text-text-primary' : 'text-muted'}`}>{stepName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Form Area */}
      <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl mb-8 min-h-[400px]">
        
        {/* STEP 1: Overview */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-xl font-bold mb-6">Gig Title</h2>
              <textarea 
                className="w-full bg-primary border border-border rounded-xl p-4 text-xl font-display font-bold outline-none focus:border-accent transition-colors resize-none"
                placeholder="I will do something I'm really good at..."
                rows="2"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <p className="text-right text-xs text-muted mt-2">{formData.title.length}/80 max</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-text-primary">Category</label>
                <select 
                  className="w-full bg-primary border border-border rounded-lg p-3 outline-none focus:border-accent appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-text-primary">Subcategory</label>
                <input 
                  type="text" 
                  className="w-full bg-primary border border-border rounded-lg p-3 outline-none focus:border-accent"
                  placeholder="e.g. Logo Design"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-text-primary">Search Tags (Max 5)</label>
              <input 
                type="text" 
                className="w-full bg-primary border border-border rounded-lg p-3 outline-none focus:border-accent"
                placeholder="Press Enter to add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagAdd}
                disabled={formData.tags.length >= 5}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    {tag} <X className="w-3 h-3 cursor-pointer hover:text-text-primary" onClick={() => removeTag(tag)} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Pricing */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold mb-6">Scope & Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border rounded-xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border">
              {formData.packages.map((pkg, idx) => (
                <div key={pkg.type} className="flex flex-col bg-primary/30 p-5 hover:bg-primary/50 transition-colors">
                  <div className="text-center font-bold text-accent uppercase tracking-wider mb-6 pb-4 border-b border-border/50">{pkg.type}</div>
                  
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-bold text-muted mb-1 block">Package Name</label>
                      <input type="text" value={pkg.name} onChange={(e) => handlePackageChange(idx, 'name', e.target.value)} className="w-full bg-primary border border-border rounded p-2 text-sm outline-none focus:border-accent" placeholder="e.g. Silver Plan" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted mb-1 block">Short Description</label>
                      <textarea value={pkg.desc} onChange={(e) => handlePackageChange(idx, 'desc', e.target.value)} rows="3" className="w-full bg-primary border border-border rounded p-2 text-sm outline-none focus:border-accent resize-none" placeholder="What's included..." />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted mb-1 block">Delivery Time</label>
                      <input type="text" value={pkg.delivery} onChange={(e) => handlePackageChange(idx, 'delivery', e.target.value)} className="w-full bg-primary border border-border rounded p-2 text-sm outline-none focus:border-accent" placeholder="e.g. 3 Days" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted mb-1 block">Revisions</label>
                      <input type="number" value={pkg.revisions} onChange={(e) => handlePackageChange(idx, 'revisions', e.target.value)} className="w-full bg-primary border border-border rounded p-2 text-sm outline-none focus:border-accent" placeholder="e.g. 2" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted mb-1 block">Price ($)</label>
                      <input type="number" value={pkg.price} onChange={(e) => handlePackageChange(idx, 'price', e.target.value)} className="w-full bg-primary border border-border rounded p-2 font-bold text-accent outline-none focus:border-accent" placeholder="100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Description & FAQ */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-sm text-muted mb-4">Briefly describe what you're offering in this gig.</p>
              <textarea 
                className="w-full bg-primary border border-border rounded-xl p-4 text-base outline-none focus:border-accent transition-colors resize-y min-h-[200px]"
                placeholder="I will perfectly craft..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
                <Button variant="ghost" size="sm" onClick={addFAQ} className="gap-2"><Plus className="w-4 h-4"/> Add FAQ</Button>
              </div>
              
              {formData.faqs.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted">
                  No FAQs added yet.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {formData.faqs.map((faq, idx) => (
                    <div key={idx} className="bg-primary border border-border rounded-xl p-4 flex gap-4 items-start relative group">
                      <div className="flex-1 flex flex-col gap-3">
                        <input type="text" value={faq.question} onChange={(e) => updateFAQ(idx, 'question', e.target.value)} placeholder="Add a question..." className="w-full bg-transparent font-bold outline-none border-b border-border focus:border-accent pb-1" />
                        <input type="text" value={faq.answer} onChange={(e) => updateFAQ(idx, 'answer', e.target.value)} placeholder="Add an answer..." className="w-full bg-transparent text-sm text-muted outline-none border-b border-border focus:border-accent pb-1" />
                      </div>
                      <button onClick={() => removeFAQ(idx)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-5 h-5"/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Gallery */}
        {currentStep === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold mb-2">Showcase your services</h2>
            <p className="text-sm text-muted mb-8">Upload up to 5 high-quality images. The first image will be your gig cover.</p>
            
            <div 
              className="w-full border-2 border-dashed border-border hover:border-accent transition-colors rounded-2xl bg-primary/50 flex flex-col items-center justify-center py-16 cursor-pointer mb-8 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold">Drag & drop photos or <span className="text-accent underline">browse</span></h3>
              <p className="text-muted text-sm mt-2">Maximum file size 5MB (JPG, PNG)</p>
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-border group bg-surface flex items-center justify-center">
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeImage(idx)} className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform"><X className="w-4 h-4"/></button>
                    </div>
                    {idx === 0 && <span className="absolute top-2 left-2 bg-accent text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Cover</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={prevStep} disabled={currentStep === 1 || isSubmitting}>
          Back
        </Button>
        {currentStep < 4 ? (
          <Button variant="primary" onClick={nextStep}>
            Save & Continue
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
            Publish Gig
          </Button>
        )}
      </div>

    </div>
  );
}
