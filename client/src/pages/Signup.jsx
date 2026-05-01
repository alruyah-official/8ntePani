import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Eye, EyeOff, User, Lock, Briefcase, Code2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context';
import { authApi } from '../api/auth';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setFieldErrors({});
    setApiError('');
    setIsSubmitting(true);
    
    try {
      const data = await authApi.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      // The API interceptor returns the data object directly, so data has token and user
      login(data.token, data.user);
      
      if (formData.role === 'seller') {
        navigate('/dashboard');
      } else {
        navigate('/explore');
      }
    } catch (err) {
      setApiError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-80px)] items-center justify-center bg-primary px-4 py-12">
      <div 
        className="w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl p-8 md:p-10"
        style={{ animation: 'fadeInUp 0.5s ease-out forwards' }}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <span className="text-3xl font-display font-bold text-text-primary tracking-tight">
              Skill<span className="text-accent italic">Hive</span>
            </span>
          </Link>
          <h2 className="text-3xl font-bold font-display text-text-primary mb-2">Create an account</h2>
          <p className="text-muted">Join our community and start your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div 
              onClick={() => setFormData({...formData, role: 'buyer'})}
              className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                formData.role === 'buyer' 
                  ? 'border-accent bg-accent/5' 
                  : 'border-border bg-primary hover:border-muted'
              }`}
            >
              {formData.role === 'buyer' && (
                <div className="absolute top-3 right-3 text-accent">
                  <CheckCircle2 className="w-5 h-5 fill-accent/20" />
                </div>
              )}
              <Briefcase className={`w-8 h-8 mb-3 ${formData.role === 'buyer' ? 'text-accent' : 'text-muted'}`} />
              <span className={`font-bold ${formData.role === 'buyer' ? 'text-text-primary' : 'text-muted'}`}>I want to hire</span>
            </div>
            
            <div 
              onClick={() => setFormData({...formData, role: 'seller'})}
              className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                formData.role === 'seller' 
                  ? 'border-accent bg-accent/5' 
                  : 'border-border bg-primary hover:border-muted'
              }`}
            >
              {formData.role === 'seller' && (
                <div className="absolute top-3 right-3 text-accent">
                  <CheckCircle2 className="w-5 h-5 fill-accent/20" />
                </div>
              )}
              <Code2 className={`w-8 h-8 mb-3 ${formData.role === 'seller' ? 'text-accent' : 'text-muted'}`} />
              <span className={`font-bold ${formData.role === 'seller' ? 'text-text-primary' : 'text-muted'}`}>I want to work</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  className={`w-full bg-primary border rounded-xl py-3 pl-12 pr-4 text-text-primary outline-none transition-colors ${fieldErrors.name ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-accent'}`}
                  disabled={isSubmitting}
                />
              </div>
              {fieldErrors.name && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="you@example.com"
                  className={`w-full bg-primary border rounded-xl py-3 pl-12 pr-4 text-text-primary outline-none transition-colors ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-accent'}`}
                  disabled={isSubmitting}
                />
              </div>
              {fieldErrors.email && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Min. 8 characters"
                  className={`w-full bg-primary border rounded-xl py-3 pl-12 pr-12 text-text-primary outline-none transition-colors ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-accent'}`}
                  disabled={isSubmitting}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Repeat password"
                  className={`w-full bg-primary border rounded-xl py-3 pl-12 pr-12 text-text-primary outline-none transition-colors ${fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-accent'}`}
                  disabled={isSubmitting}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-text-primary transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{fieldErrors.confirmPassword}</p>}
            </div>
          </div>

          <div className="mt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-accent text-[#0A0A0A] font-bold rounded-xl py-3.5 hover:bg-[#bce628] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(200,241,53,0.15)]"
            >
              {isSubmitting && (
                <div className="w-5 h-5 border-2 border-[#0A0A0A]/20 border-t-[#0A0A0A] rounded-full animate-spin"></div>
              )}
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
            
            {apiError && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center break-words">
                {apiError}
              </div>
            )}
          </div>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
