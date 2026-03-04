import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiMail, FiLock, FiEye, FiEyeOff,
  FiShoppingBag, FiArrowRight, FiAlertCircle
} from 'react-icons/fi';
import './Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
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
    dispatch(loginStart());
    try {
      const res = await authAPI.login(formData);
      dispatch(loginSuccess(res.data));
      dispatch(fetchCart());
      toast.success(`Welcome back, ${res.data.user.name}! 🎉`);
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
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
              Your premium<br />
              <span className="auth-gradient-text">shopping</span><br />
              experience.
            </h2>
            <p className="auth-left-desc">
              Discover thousands of products curated just for you. 
              Fast delivery, easy returns, and unbeatable prices.
            </p>

            <div className="auth-stats">
              {[
                { value: '50K+', label: 'Products' },
                { value: '2M+', label: 'Customers' },
                { value: '4.9★', label: 'Rating' },
              ].map((stat, i) => (
                <div className="auth-stat" key={i} style={{ animationDelay: `${i * 0.1 + 0.5}s` }}>
                  <span className="auth-stat-value">{stat.value}</span>
                  <span className="auth-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="auth-avatars">
              {['#f97316', '#8b5cf6', '#06b6d4', '#10b981'].map((color, i) => (
                <div key={i} className="auth-avatar" style={{ background: color, zIndex: 4 - i }} />
              ))}
              <span className="auth-avatars-text">Join 2M+ happy shoppers</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-right">
          <div className="auth-form-card">
            <div className="auth-form-header">
              <div className="auth-form-icon">
                <FiLock />
              </div>
              <h3 className="auth-form-title">Welcome back</h3>
              <p className="auth-form-subtitle">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {/* Email Field */}
              <div className={`auth-field ${focused === 'email' ? 'focused' : ''} ${errors.email ? 'has-error' : ''} ${formData.email ? 'has-value' : ''}`}>
                <label className="auth-field-label">Email Address</label>
                <div className="auth-field-wrapper">
                  <span className="auth-field-icon"><FiMail /></span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    className="auth-field-input"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span className="auth-field-error">
                    <FiAlertCircle /> {errors.email}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className={`auth-field ${focused === 'password' ? 'focused' : ''} ${errors.password ? 'has-error' : ''} ${formData.password ? 'has-value' : ''}`}>
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
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-field-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="auth-field-error">
                    <FiAlertCircle /> {errors.password}
                  </span>
                )}
              </div>

              {/* Forgot Password */}
              <div className="auth-forgot">
                <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
              </div>

              {/* Submit Button */}
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="auth-btn-loader" />
                ) : (
                  <>
                    Sign In
                    <FiArrowRight className="auth-btn-icon" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="auth-divider">
                <span>Don't have an account?</span>
              </div>

              {/* Register Link */}
              <Link to="/register" className="auth-alt-btn">
                Create Account
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
