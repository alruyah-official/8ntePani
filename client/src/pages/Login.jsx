import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context';
import { authApi } from '../api/auth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Response shape: { token, refreshToken, user, message }
      const { token, refreshToken, user } = await authApi.login({ email, password });
      login(token, user, refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-80px)] items-center justify-center bg-primary px-4 py-12">
      <div 
        className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-8"
        style={{ animation: 'fadeInUp 0.5s ease-out forwards' }}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src="8ntepani.logowhite.png" alt="" style={{
              height: "200px",
              width: "200px",
              objectFit: "cover"
            }} />
          </Link>
          <h2 className="text-2xl font-bold font-display text-text-primary">Welcome back</h2>
          <p className="text-muted mt-2">Sign in to continue to your dashboard.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                <Mail className="w-5 h-5" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-primary border border-border rounded-xl py-3 pl-12 pr-4 text-text-primary outline-none focus:border-accent transition-colors"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-primary border border-border rounded-xl py-3 pl-4 pr-12 text-text-primary outline-none focus:border-accent transition-colors"
                disabled={isSubmitting}
                required
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
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-2 bg-accent text-[#0A0A0A] font-bold rounded-xl py-3 hover:bg-[#bce628] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <div className="w-5 h-5 border-2 border-[#0A0A0A]/20 border-t-[#0A0A0A] rounded-full animate-spin"></div>
            )}
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent hover:underline">
            Join free
          </Link>
        </div>
      </div>
    </div>
  );
}
