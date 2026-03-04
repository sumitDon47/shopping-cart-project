import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, setRegistrationStep } from '../../redux/slices/authSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiUser,
  FiShoppingBag, FiArrowRight, FiAlertCircle,
  FiCheckCircle, FiRefreshCw, FiShield
} from 'react-icons/fi';
import './Auth.css';

// ─── Step 1: Send OTP ────────────────────────────────────────────────────────
const SendOTPStep = ({ onSuccess, registrationData, setRegistrationData }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!registrationData.name.trim()) newErrors.name = 'Name is required';
    else if (registrationData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!registrationData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(registrationData.email)) newErrors.email = 'Enter a valid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.sendOTP({ name: registrationData.name, email: registrationData.email });
      toast.success('OTP sent! Check your email 📧');
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      toast.error(msg);
      if (msg.includes('already exists')) {
        setErrors({ email: 'This email is already registered' });
      }
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
          <FiUser />
        </div>
        <h3 className="auth-form-title">Create Account</h3>
        <p className="auth-form-subtitle">Enter your details to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Name Field */}
        <div className={`auth-field ${focused === 'name' ? 'focused' : ''} ${errors.name ? 'has-error' : ''}`}>
          <label className="auth-field-label">Full Name</label>
          <div className="auth-field-wrapper">
            <span className="auth-field-icon"><FiUser /></span>
            <input
              type="text"
              name="name"
              value={registrationData.name}
              onChange={handleChange}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused('')}
              className="auth-field-input"
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>
          {errors.name && (
            <span className="auth-field-error"><FiAlertCircle /> {errors.name}</span>
          )}
        </div>

        {/* Email Field */}
        <div className={`auth-field ${focused === 'email' ? 'focused' : ''} ${errors.email ? 'has-error' : ''}`}>
          <label className="auth-field-label">Email Address</label>
          <div className="auth-field-wrapper">
            <span className="auth-field-icon"><FiMail /></span>
            <input
              type="email"
              name="email"
              value={registrationData.email}
              onChange={handleChange}
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
              Send Verification Code
              <FiArrowRight className="auth-btn-icon" />
            </>
          )}
        </button>

        <div className="auth-divider">
          <span>Already have an account?</span>
        </div>
        <Link to="/login" className="auth-alt-btn">Sign In</Link>
      </form>
    </div>
  );
};

// ─── Step 2: Verify OTP ──────────────────────────────────────────────────────
const VerifyOTPStep = ({ onSuccess, registrationData, onBack }) => {
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
      handleVerify(newOtp.join(''));
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
      handleVerify(paste);
    }
  };

  const handleVerify = async (otpValue) => {
    if (loading) return;
    setLoading(true);
    try {
      // Just verify step, not setting password yet
      onSuccess(otpValue);
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      await authAPI.resendOTP({ email: registrationData.email });
      toast.success('New OTP sent! 📧');
      setOtp(['', '', '', '', '', '']);
      setCanResend(false);
      setCountdown(60);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error('Failed to resend OTP');
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
          <FiMail />
        </div>
        <h3 className="auth-form-title">Check Your Email</h3>
        <p className="auth-form-subtitle">
          We sent a 6-digit code to<br />
          <strong className="auth-email-highlight">{registrationData.email}</strong>
        </p>
      </div>

      <div className="auth-form">
        {/* OTP Input */}
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

        {loading && (
          <div className="otp-verifying">
            <span className="auth-btn-loader small" />
            <span>Verifying your code...</span>
          </div>
        )}

        {/* Resend */}
        <div className="otp-resend">
          {!canResend ? (
            <p className="otp-countdown">
              Resend code in <strong>{countdown}s</strong>
            </p>
          ) : (
            <button
              type="button"
              className="otp-resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? <span className="auth-btn-loader small" /> : <FiRefreshCw />}
              Resend Code
            </button>
          )}
        </div>

        <button
          className="auth-submit-btn"
          onClick={() => handleVerify(otp.join(''))}
          disabled={loading || otp.some(d => d === '')}
        >
          {loading ? <span className="auth-btn-loader" /> : <>Verify Code <FiArrowRight className="auth-btn-icon" /></>}
        </button>

        <button type="button" className="auth-back-btn" onClick={onBack}>
          ← Use different email
        </button>
      </div>
    </div>
  );
};

// ─── Step 3: Set Password ────────────────────────────────────────────────────
const SetPasswordStep = ({ registrationData, otpCode, onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState('');
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [strength, setStrength] = useState(0);

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setStrength(score);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') calculateStrength(value);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
    else if (!/(?=.*[A-Z])/.test(formData.password)) newErrors.password = 'Must include uppercase letter';
    else if (!/(?=.*[0-9])/.test(formData.password)) newErrors.password = 'Must include a number';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP({
        email: registrationData.email,
        otp: otpCode,
        password: formData.password
      });
      dispatch(loginSuccess(res.data));
      dispatch(fetchCart());
      toast.success('Account created successfully! 🎉');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (msg.includes('OTP') || msg.includes('expired')) {
        toast.error('OTP expired. Please restart.');
        onBack();
      }
    } finally {
      setLoading(false);
    }
  };

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
        <div className="auth-form-icon password-icon">
          <FiShield />
        </div>
        <h3 className="auth-form-title">Set Your Password</h3>
        <p className="auth-form-subtitle">
          Create a secure password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Password */}
        <div className={`auth-field ${focused === 'password' ? 'focused' : ''} ${errors.password ? 'has-error' : ''}`}>
          <label className="auth-field-label">Password</label>
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
              placeholder="Min. 6 characters"
            />
            <button type="button" className="auth-field-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && (
            <span className="auth-field-error"><FiAlertCircle /> {errors.password}</span>
          )}

          {/* Strength Meter */}
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bars">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="strength-bar"
                    style={{ background: i <= strength ? strengthColors[strength] : '#e2e8f0' }}
                  />
                ))}
              </div>
              <span className="strength-label" style={{ color: strengthColors[strength] }}>
                {strengthLabels[strength]}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className={`auth-field ${focused === 'confirm' ? 'focused' : ''} ${errors.confirmPassword ? 'has-error' : ''}`}>
          <label className="auth-field-label">Confirm Password</label>
          <div className="auth-field-wrapper">
            <span className="auth-field-icon"><FiLock /></span>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => setFocused('confirm')}
              onBlur={() => setFocused('')}
              className="auth-field-input"
              placeholder="Re-enter your password"
            />
            <button type="button" className="auth-field-toggle" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="auth-field-error"><FiAlertCircle /> {errors.confirmPassword}</span>
          )}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <span className="auth-field-success"><FiCheckCircle /> Passwords match!</span>
          )}
        </div>

        {/* Password Requirements */}
        <div className="password-requirements">
          {[
            { met: formData.password.length >= 6, text: 'At least 6 characters' },
            { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
            { met: /[0-9]/.test(formData.password), text: 'One number' },
          ].map((req, i) => (
            <div key={i} className={`requirement ${req.met ? 'met' : ''}`}>
              <FiCheckCircle />
              <span>{req.text}</span>
            </div>
          ))}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? (
            <span className="auth-btn-loader" />
          ) : (
            <>Create My Account <FiArrowRight className="auth-btn-icon" /></>
          )}
        </button>
      </form>
    </div>
  );
};

// ─── Main Register Page ──────────────────────────────────────────────────────
const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [currentStep, setCurrentStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [registrationData, setRegistrationData] = useState({ name: '', email: '' });

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  return (
    <div className={`auth-page ${mounted ? 'mounted' : ''}`}>
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)' }} />
        <div className="auth-orb auth-orb-2" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />
        <div className="auth-orb auth-orb-3" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)' }} />
        <div className="auth-grid" />
      </div>

      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left register-left">
          <div className="auth-brand">
            <div className="auth-logo">
              <FiShoppingBag />
            </div>
            <h1 className="auth-brand-name">ShopCart</h1>
          </div>

          <div className="auth-left-content">
            <h2 className="auth-left-title">
              Start your<br />
              <span className="auth-gradient-text">journey</span><br />
              with us today.
            </h2>
            <p className="auth-left-desc">
              Join millions of shoppers who trust ShopCart for the best deals, 
              fastest delivery, and premium products.
            </p>

            {/* Benefits */}
            <div className="auth-benefits">
              {[
                { icon: '🚀', title: 'Fast Delivery', desc: 'Next-day delivery available' },
                { icon: '🔒', title: 'Secure Payments', desc: '256-bit SSL encryption' },
                { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
              ].map((benefit, i) => (
                <div key={i} className="auth-benefit" style={{ animationDelay: `${i * 0.15 + 0.5}s` }}>
                  <span className="auth-benefit-icon">{benefit.icon}</span>
                  <div>
                    <h4>{benefit.title}</h4>
                    <p>{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <div className="auth-form-card">
            {currentStep === 1 && (
              <SendOTPStep
                onSuccess={() => setCurrentStep(2)}
                registrationData={registrationData}
                setRegistrationData={setRegistrationData}
              />
            )}
            {currentStep === 2 && (
              <VerifyOTPStep
                onSuccess={(otp) => { setOtpCode(otp); setCurrentStep(3); }}
                registrationData={registrationData}
                onBack={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 3 && (
              <SetPasswordStep
                registrationData={registrationData}
                otpCode={otpCode}
                onBack={() => setCurrentStep(1)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
