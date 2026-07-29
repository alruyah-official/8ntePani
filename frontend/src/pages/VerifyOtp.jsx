import '../styles/pages/Auth.css';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // 60 seconds

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Registration state passed from Register.jsx
  const regState = location.state || {};
  const [email, setEmail] = useState(regState.email || '');

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [timer, setTimer] = useState(RESEND_COOLDOWN);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  // Focus first input box on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleInputChange = (index, value) => {
    // Only accept numeric inputs
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take the last typed character
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(null);

    // Auto advance to next box
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit if all digits are entered
    if (newOtp.every((digit) => digit !== '')) {
      handleCompleteRegistration(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move back to previous box if current is empty
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, OTP_LENGTH).split('');
    const newOtp = [...Array(OTP_LENGTH)].map((_, i) => digits[i] || '');
    setOtp(newOtp);

    // Focus last filled index or final index
    const nextIndex = Math.min(digits.length, OTP_LENGTH - 1);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }

    if (digits.length === OTP_LENGTH) {
      handleCompleteRegistration(pastedData.slice(0, OTP_LENGTH));
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    if (!email) {
      setError('Please provide a valid email address.');
      return;
    }

    setResending(true);
    setError(null);
    try {
      await api.post('/api/auth/send-otp', { email });
      setTimer(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleCompleteRegistration = async (enteredCode) => {
    const fullOtp = enteredCode || otp.join('');
    if (fullOtp.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits of your verification code.');
      triggerShake();
      return;
    }

    if (!regState.name || !regState.password || !email) {
      setError('Registration information missing. Please return to the registration page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/api/auth/register', {
        email,
        otp: fullOtp,
        password: regState.password,
        name: regState.name,
        role: regState.role || 'CLIENT',
      });

      if (res.data.success) {
        setSuccess(true);
        const { user, token } = res.data.data;
        login(user, token);

        // Transition to dashboard or login after success animation
        setTimeout(() => {
          navigate(user.role === 'FREELANCER' ? '/dashboard' : '/');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Invalid or expired code.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  return (
    <div className="auth-page">
      <div className={`auth-card ${shake ? 'otp-shake' : ''}`}>
        <Link to="/register" className="auth-back-arrow" aria-label="Back to registration">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>

        {/* Logo */}
        <div className="auth-logo">
          <img src="/logo.png" alt="8ntePani Logo" className="auth-logo-img" style={{ height: '180px', objectFit: 'contain', margin: '-40px 0' }} />
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Verify your email</h1>
          <p className="auth-subtitle">
            We sent a 6-digit code to <strong>{email || 'your email'}</strong>
          </p>
        </div>

        {error && (
          <div className="error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#ecfdf5', border: '1px solid #10b981', color: '#047857',
            padding: '1rem', borderRadius: '12px', textAlign: 'center', fontWeight: '600',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            Account verified successfully! Redirecting...
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleCompleteRegistration(); }}>
          <div className="otp-container" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`otp-box ${digit ? 'filled' : ''}`}
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading || success}
                autoComplete="off"
              />
            ))}
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
            disabled={loading || success || otp.join('').length !== OTP_LENGTH}
            style={{ marginTop: 'var(--space-4)' }}
          >
            {loading ? 'Verifying...' : 'Verify & Complete'}
          </button>
        </form>

        <div className="otp-timer-wrapper">
          <span>Didn't receive the code?</span>
          <button
            type="button"
            className="otp-resend-btn"
            onClick={handleResend}
            disabled={timer > 0 || resending || loading}
          >
            {resending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
