import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiMail, FiLock, FiEye, FiEyeOff,
  FiShoppingBag, FiArrowRight, FiAlertCircle,
  FiCheckCircle, FiRefreshCw, FiShield, FiArrowLeft
} from 'react-icons/fi';
import './Auth.css';

// ─── Step 1: Enter Email ─────────────────────────────────────────────────────
const EmailStep = ({ onSuccess, email, setEmail }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      toast.success('Reset code sent! Check your email 📧');
      onSuccess(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset code';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-step fade-in-up">
      <div className="auth-step-indicator">
        <div className="step active"><span>1</span></div>
        <div className="step-line" />
        <div className="step"><span>2</span></div>
        <div className="step-line" />
        <div className="step"><span>3</span></div>
      </div>

      <div className="auth-form-header">
        <div className="auth-form-icon">
          <FiMail />
        </div>
        <h3 className="auth-form-title">Forgot Password?</h3>
        <p className="auth-form-subtitle">Enter your email and we'll send you a reset code</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className={`auth-field ${focused === 'email' ? 'focused' : ''} ${errors.email ? 'has-error' : ''} ${email ? 'has-value' : ''}`}>
          <label className="auth-field-label">Email Address</label>
          <div className="auth-field-wrapper">
            <span className="auth-field-icon"><FiMail /></span>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({}); }}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              className="auth-field-input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <span className="auth-field-error"><FiAlertCircle /> {errors.email}</span>
          )}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? (
            <span className="auth-btn-loader" />
          ) : (
            <>
              Send Reset Code
              <FiArrowRight className="auth-btn-icon" />
            </>
          )}
        </button>

        <div className="auth-divider">
          <span>Remember your password?</span>
        </div>
        <Link to="/login" className="auth-alt-btn">
          <FiArrowLeft style={{ marginRight: '0.5rem' }} />
          Back to Sign In
        </Link>
      </form>
    </div>
  );
};

// ─── Step 2: Verify OTP ──────────────────────────────────────────────────────
const OTPStep = ({ onSuccess, email, onBack, devOtp }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      onSuccess(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      onSuccess(paste);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      toast.success('New code sent! 📧');
      setOtp(['', '', '', '', '', '']);
      setCanResend(false);
      setCountdown(60);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-step fade-in-up">
      <div className="auth-step-indicator">
        <div className="step done"><FiCheckCircle /></div>
        <div className="step-line active" />
        <div className="step active"><span>2</span></div>
        <div className="step-line" />
        <div className="step"><span>3</span></div>
      </div>

      <div className="auth-form-header">
        <div className="auth-form-icon otp-icon">
          <FiShield />
        </div>
        <h3 className="auth-form-title">Enter Reset Code</h3>
        <p className="auth-form-subtitle">
          We sent a 6-digit code to<br />
          <strong className="auth-email-highlight">{email}</strong>
        </p>
      </div>

      <div className="auth-form">
        <div className="otp-container" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className={`otp-input ${digit ? 'filled' : ''} ${loading ? 'loading' : ''}`}
              disabled={loading}
            />
          ))}
        </div>

        <div className="auth-resend">
          {canResend ? (
            <button
              type="button"
              className="auth-resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? <FiRefreshCw className="spinning" /> : <FiRefreshCw />}
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          ) : (
            <span className="auth-resend-timer">
              Resend code in <strong>{countdown}s</strong>
            </span>
          )}
        </div>

        <button type="button" className="auth-back-btn" onClick={onBack}>
          <FiArrowLeft /> Back
        </button>
      </div>
    </div>
  );
};

// ─── Step 3: New Password ────────────────────────────────────────────────────
const NewPasswordStep = ({ email, otpValue, onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Must be at least 6 characters';
    else if (!/(?=.*[a-z])/.test(formData.password)) newErrors.password = 'Must contain a lowercase letter';
    else if (!/(?=.*[A-Z])/.test(formData.password)) newErrors.password = 'Must contain an uppercase letter';
    else if (!/(?=.*\d)/.test(formData.password)) newErrors.password = 'Must contain a number';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp: otpValue, password: formData.password });
      setSuccess(true);
      toast.success('Password reset successfully! 🎉');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      toast.error(msg);
      if (msg.includes('expired') || msg.includes('not found') || msg.includes('Invalid')) {
        // OTP issue — go back
        onBack();
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-step fade-in-up">
        <div className="auth-form-header">
          <div className="auth-form-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
            <FiCheckCircle />
          </div>
          <h3 className="auth-form-title">Password Reset!</h3>
          <p className="auth-form-subtitle">
            Your password has been updated. Redirecting to login...
          </p>
        </div>
        <div className="auth-form">
          <Link to="/login" className="auth-submit-btn" style={{ textAlign: 'center', textDecoration: 'none' }}>
            Go to Login
            <FiArrowRight className="auth-btn-icon" />
          </Link>
        </div>
      </div>
    );
  }

  const passwordChecks = [
    { label: 'At least 6 characters', valid: formData.password.length >= 6 },
    { label: 'One lowercase letter', valid: /[a-z]/.test(formData.password) },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(formData.password) },
    { label: 'One number', valid: /\d/.test(formData.password) },
  ];

  return (
    <div className="auth-step fade-in-up">
      <div className="auth-step-indicator">
        <div className="step done"><FiCheckCircle /></div>
        <div className="step-line active" />
        <div className="step done"><FiCheckCircle /></div>
        <div className="step-line active" />
        <div className="step active"><span>3</span></div>
      </div>

      <div className="auth-form-header">
        <div className="auth-form-icon">
          <FiLock />
        </div>
        <h3 className="auth-form-title">Set New Password</h3>
        <p className="auth-form-subtitle">Create a strong password for your account</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* New Password */}
        <div className={`auth-field ${focused === 'password' ? 'focused' : ''} ${errors.password ? 'has-error' : ''} ${formData.password ? 'has-value' : ''}`}>
          <label className="auth-field-label">New Password</label>
          <div className="auth-field-wrapper">
            <span className="auth-field-icon"><FiLock /></span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              className="auth-field-input"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button type="button" className="auth-field-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && (
            <span className="auth-field-error"><FiAlertCircle /> {errors.password}</span>
          )}
        </div>

        {/* Password Requirements */}
        {formData.password && (
          <div className="password-requirements">
            {passwordChecks.map((check, i) => (
              <div key={i} className={`password-req ${check.valid ? 'valid' : ''}`}>
                <FiCheckCircle />
                <span>{check.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Confirm Password */}
        <div className={`auth-field ${focused === 'confirmPassword' ? 'focused' : ''} ${errors.confirmPassword ? 'has-error' : ''} ${formData.confirmPassword ? 'has-value' : ''}`}>
          <label className="auth-field-label">Confirm Password</label>
          <div className="auth-field-wrapper">
            <span className="auth-field-icon"><FiLock /></span>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => setFocused('confirmPassword')}
              onBlur={() => setFocused('')}
              className="auth-field-input"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button type="button" className="auth-field-toggle" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="auth-field-error"><FiAlertCircle /> {errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? (
            <span className="auth-btn-loader" />
          ) : (
            <>
              Reset Password
              <FiArrowRight className="auth-btn-icon" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// ─── Main Forgot Password Page ───────────────────────────────────────────────
const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleEmailSuccess = (data) => {
    if (data?.otp) setDevOtp(data.otp); // dev mode only
    setStep(2);
  };

  const handleOTPSuccess = (otp) => {
    setOtpValue(otp);
    setStep(3);
  };

  return (
    <div className={`auth-page ${mounted ? 'mounted' : ''}`}>
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-grid" />
      </div>

      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo">
              <FiShoppingBag />
            </div>
            <h1 className="auth-brand-name">ShopCart</h1>
          </div>

          <div className="auth-left-content">
            <h2 className="auth-left-title">
              Reset your<br />
              <span className="auth-gradient-text">password</span><br />
              securely.
            </h2>
            <p className="auth-left-desc">
              Don't worry, it happens to the best of us.
              We'll send you a verification code to reset your password.
            </p>

            <div className="auth-benefits">
              {[
                { icon: '🔒', title: 'Secure Reset', desc: 'OTP-verified password reset' },
                { icon: '⚡', title: 'Quick Process', desc: 'Reset in under a minute' },
                { icon: '🛡️', title: 'Account Safe', desc: 'Your data remains protected' },
              ].map((benefit, i) => (
                <div className="auth-benefit" key={i} style={{ animationDelay: `${i * 0.1 + 0.5}s` }}>
                  <span className="auth-benefit-icon">{benefit.icon}</span>
                  <div>
                    <strong>{benefit.title}</strong>
                    <span>{benefit.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <div className="auth-form-card">
            {step === 1 && (
              <EmailStep
                onSuccess={handleEmailSuccess}
                email={email}
                setEmail={setEmail}
              />
            )}
            {step === 2 && (
              <OTPStep
                onSuccess={handleOTPSuccess}
                email={email}
                onBack={() => setStep(1)}
                devOtp={devOtp}
              />
            )}
            {step === 3 && (
              <NewPasswordStep
                email={email}
                otpValue={otpValue}
                onBack={() => setStep(2)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
