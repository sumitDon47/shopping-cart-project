import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, updateUser } from '../../redux/slices/authSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import { authAPI } from '../../services/api';
import { GOOGLE_CLIENT_ID } from '../../utils/constants';
import toast from 'react-hot-toast';
import {
  FiX, FiMail, FiLock, FiEye, FiEyeOff, FiUser,
  FiArrowRight, FiAlertCircle, FiCheckCircle, FiRefreshCw,
} from 'react-icons/fi';
import './AuthModal.css';

/* ── Google SVG icon ───────── */
const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

/* ════════════════════════════════════════════════════════════
   AuthModal — Login + full Sign-Up (3 steps) in an overlay
   ════════════════════════════════════════════════════════════ */
const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const [tab, setTab] = useState(initialTab);

  // ── Login state ──
  const [loginData, setLoginData]       = useState({ email: '', password: '' });
  const [showLoginPw, setShowLoginPw]   = useState(false);
  const [loginErrors, setLoginErrors]   = useState({});
  const [googleError, setGoogleError]   = useState('');

  // ── Sign-up state (all 3 steps) ──
  const [signupStep, setSignupStep]       = useState(1); // 1=name/email, 2=OTP, 3=password
  const [signupData, setSignupData]       = useState({ name: '', email: '' });
  const [signupErrors, setSignupErrors]   = useState({});
  const [signupLoading, setSignupLoading] = useState(false);

  // OTP state
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpSendCount, setOtpSendCount] = useState(0); // max 3 sends
  const otpRefs = useRef([]);

  // Password state
  const [pwData, setPwData]       = useState({ password: '', confirmPassword: '' });
  const [showPw, setShowPw]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwErrors, setPwErrors]   = useState({});
  const [pwLoading, setPwLoading] = useState(false);
  const [otpCode, setOtpCode]     = useState('');

  // Sync tab when parent changes initialTab
  useEffect(() => { setTab(initialTab); }, [initialTab]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Reset everything when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLoginData({ email: '', password: '' });
      setLoginErrors({});
      setShowLoginPw(false);
      setSignupStep(1);
      setSignupData({ name: '', email: '' });
      setSignupErrors({});
      setOtp(['', '', '', '', '', '']);
      setPwData({ password: '', confirmPassword: '' });
      setPwErrors({});
      setOtpCode('');
      setOtpSendCount(0);
      setGoogleAvatar('');
      setGoogleError('');
    }
  }, [isOpen]);

  // OTP countdown timer
  useEffect(() => {
    if (signupStep !== 2) return;
    setCountdown(60);
    setCanResend(false);
    const timer = setInterval(() => {
      setCountdown((p) => {
        if (p <= 1) { setCanResend(true); clearInterval(timer); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [signupStep]);

  /* ═══════ LOGIN ═══════ */
  const validateLogin = () => {
    const errs = {};
    if (!loginData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) errs.email = 'Enter a valid email';
    if (!loginData.password) errs.password = 'Password is required';
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((p) => ({ ...p, [name]: value }));
    if (loginErrors[name]) setLoginErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    dispatch(loginStart());
    try {
      const res = await authAPI.login(loginData);
      dispatch(loginSuccess(res.data));
      dispatch(fetchCart());
      toast.success(`Welcome back, ${res.data.user.name}! 🎉`);
      onClose();
      if (res.data.user.role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
  };

  /* ═══════ SIGN-UP STEP 1: Name + Email ═══════ */
  const validateSignup = () => {
    const errs = {};
    if (!signupData.name.trim()) errs.name = 'Name is required';
    else if (signupData.name.trim().length < 2) errs.name = 'At least 2 characters';
    if (!signupData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(signupData.email)) errs.email = 'Enter a valid email';
    setSignupErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((p) => ({ ...p, [name]: value }));
    if (signupErrors[name]) setSignupErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setSignupLoading(true);
    try {
      await authAPI.sendOTP({ name: signupData.name, email: signupData.email });
      setOtpSendCount(1);
      toast.success('OTP sent! Check your email 📧');
      setSignupStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      toast.error(msg);
      if (msg.includes('already exists')) {
        setSignupErrors({ email: 'This email is already registered' });
      }
    } finally {
      setSignupLoading(false);
    }
  };

  /* ═══════ SIGN-UP STEP 2: OTP Verification ═══════ */
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      // auto-advance
      setOtpCode(paste);
      setSignupStep(3);
    }
  };

  const handleVerifyOtp = () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Please enter the 6-digit code'); return; }
    setOtpCode(code);
    setSignupStep(3);
  };

  const handleResendOtp = async () => {
    if (!canResend || otpSendCount >= 3) return;
    setResending(true);
    try {
      await authAPI.resendOTP({ email: signupData.email });
      setOtpSendCount((c) => c + 1);
      toast.success('New OTP sent! 📧');
      setOtp(['', '', '', '', '', '']);
      setCanResend(false);
      setCountdown(60);
      otpRefs.current[0]?.focus();
    } catch { toast.error('Failed to resend OTP'); }
    finally { setResending(false); }
  };

  /* ═══════ SIGN-UP STEP 3: Set Password ═══════ */
  const validatePw = () => {
    const errs = {};
    if (!pwData.password) errs.password = 'Password is required';
    else if (pwData.password.length < 6) errs.password = 'Minimum 6 characters';
    else if (!/[A-Z]/.test(pwData.password)) errs.password = 'Must include uppercase letter';
    else if (!/[0-9]/.test(pwData.password)) errs.password = 'Must include a number';
    if (!pwData.confirmPassword) errs.confirmPassword = 'Please confirm password';
    else if (pwData.password !== pwData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwData((p) => ({ ...p, [name]: value }));
    if (pwErrors[name]) setPwErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!validatePw()) return;
    setPwLoading(true);
    try {
      const payload = {
        email: signupData.email,
        otp: otpCode,
        password: pwData.password,
      };
      if (googleAvatar) payload.avatar = googleAvatar;

      const res = await authAPI.verifyOTP(payload);
      dispatch(loginSuccess(res.data));
      dispatch(fetchCart());
      toast.success('Account created successfully! 🎉');

      // If manual signup (no Google avatar), offer to import profile photo
      if (!googleAvatar) {
        setSignupStep(4);
      } else {
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (msg.includes('OTP') || msg.includes('expired')) {
        setSignupStep(2);
        setOtp(['', '', '', '', '', '']);
      }
    } finally {
      setPwLoading(false);
    }
  };

  /* ── Google Sign-In (direct SDK — no hook effects) ── */
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleAvatar, setGoogleAvatar] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);

  const launchGoogle = (callback) => {
    const sdk = window?.google?.accounts?.oauth2;
    if (!sdk || !GOOGLE_CLIENT_ID) {
      toast.error('Google sign-in is not available');
      return;
    }
    const client = sdk.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid profile email',
      callback: (response) => {
        if (response.error) { toast.error('Google sign-in was cancelled'); return; }
        callback(response);
      },
      error_callback: () => toast.error('Google sign-in was cancelled'),
    });
    client.requestAccessToken();
  };

  const handleGoogleSignIn = () => {
    setGoogleError('');
    launchGoogle(async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        if (userInfo.picture) setGoogleAvatar(userInfo.picture);

        const res = await authAPI.google({
          credential: tokenResponse.access_token,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          intent: tab,
        });

        if (res.data.action === 'login') {
          dispatch(loginSuccess({ token: res.data.token, user: res.data.user }));
          dispatch(fetchCart());
          toast.success(`Welcome back, ${res.data.user.name}! 🎉`);
          onClose();
          if (res.data.user.role === 'admin') navigate('/admin/dashboard');
        } else if (res.data.action === 'otp_sent') {
          setSignupData({ name: res.data.name, email: res.data.email });
          setOtpSendCount(1);
          setTab('signup');
          setSignupStep(2);
          toast.success('OTP sent to your Gmail! Verify to complete sign-up 📧');
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Google sign-in failed';
        setGoogleError(msg);
        toast.error(msg);
      } finally {
        setGoogleLoading(false);
      }
    });
  };

  const handleGoogleLink = () => {
    launchGoogle(async (tokenResponse) => {
      setLinkLoading(true);
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        if (userInfo.picture) {
          await authAPI.googleLink({ avatar: userInfo.picture });
          dispatch(updateUser({ avatar: userInfo.picture }));
          toast.success('Profile photo imported! 📸');
        }
      } catch (err) {
        toast.error('Failed to import profile photo');
      } finally {
        setLinkLoading(false);
        onClose();
      }
    });
  };

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  // Helper to switch to signup tab (resets step)
  const switchToSignup = () => { setSignupStep(1); setTab('signup'); setGoogleError(''); };

  if (!isOpen) return null;

  return createPortal(
    <div className="auth-modal-backdrop" onClick={handleBackdropClick}>
      <div className="auth-modal" role="dialog" aria-modal="true">
        {/* Close */}
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          <FiX />
        </button>

        {/* Tabs — only show when on login or signup step 1 */}
        {(tab === 'login' || (tab === 'signup' && signupStep === 1)) && (
          <div className="auth-modal-tabs">
            <button
              className={`auth-modal-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setGoogleError(''); }}
            >
              Login
            </button>
            <button
              className={`auth-modal-tab ${tab === 'signup' ? 'active' : ''}`}
              onClick={switchToSignup}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* ════════ LOGIN TAB ════════ */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} noValidate>
            <div className="auth-modal-field">
              <label>Email</label>
              <div className="auth-modal-input-wrap">
                <FiMail className="field-icon" />
                <input type="email" name="email" placeholder="Please enter your email"
                  value={loginData.email} onChange={handleLoginChange} autoComplete="email" />
              </div>
              {loginErrors.email && <span className="auth-modal-field-error"><FiAlertCircle /> {loginErrors.email}</span>}
            </div>

            <div className="auth-modal-field">
              <label>Password</label>
              <div className="auth-modal-input-wrap">
                <FiLock className="field-icon" />
                <input type={showLoginPw ? 'text' : 'password'} name="password"
                  placeholder="Please enter your password" value={loginData.password}
                  onChange={handleLoginChange} autoComplete="current-password" />
                <button type="button" className="auth-modal-toggle-pw" onClick={() => setShowLoginPw(!showLoginPw)}>
                  {showLoginPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {loginErrors.password && <span className="auth-modal-field-error"><FiAlertCircle /> {loginErrors.password}</span>}
            </div>

            <div className="auth-modal-forgot">
              <Link to="/forgot-password" onClick={onClose}>Forgot password?</Link>
            </div>

            <button type="submit" className="auth-modal-submit" disabled={loading}>
              {loading ? <span className="auth-modal-loader" /> : <>LOGIN</>}
            </button>

            <div className="auth-modal-footer">
              Don't have an account?{' '}
              <button type="button" onClick={switchToSignup}>Sign up</button>
            </div>

            {GOOGLE_CLIENT_ID && (
              <>
                <div className="auth-modal-divider">Or, login with</div>
                {googleError && (
                  <div className="auth-modal-google-error">
                    <FiAlertCircle /> {googleError}
                  </div>
                )}
                <div className="auth-modal-social">
                  <button type="button" className="auth-modal-social-btn" onClick={() => handleGoogleSignIn()} disabled={googleLoading}>
                    {googleLoading ? <span className="auth-modal-loader" /> : <><GoogleIcon /> Google</>}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* ════════ SIGN-UP STEP 1: Name + Email ════════ */}
        {tab === 'signup' && signupStep === 1 && (
          <form onSubmit={handleSignupSubmit} noValidate>
            <div className="auth-modal-field">
              <label>Full Name</label>
              <div className="auth-modal-input-wrap">
                <FiUser className="field-icon" />
                <input type="text" name="name" placeholder="Enter your full name"
                  value={signupData.name} onChange={handleSignupChange} autoComplete="name" />
              </div>
              {signupErrors.name && <span className="auth-modal-field-error"><FiAlertCircle /> {signupErrors.name}</span>}
            </div>

            <div className="auth-modal-field">
              <label>Email</label>
              <div className="auth-modal-input-wrap">
                <FiMail className="field-icon" />
                <input type="email" name="email" placeholder="Enter your email"
                  value={signupData.email} onChange={handleSignupChange} autoComplete="email" />
              </div>
              {signupErrors.email && <span className="auth-modal-field-error"><FiAlertCircle /> {signupErrors.email}</span>}
            </div>

            <button type="submit" className="auth-modal-submit" disabled={signupLoading}>
              {signupLoading ? <span className="auth-modal-loader" /> : <>Send Verification Code <FiArrowRight /></>}
            </button>

            <div className="auth-modal-footer">
              Already have an account?{' '}
              <button type="button" onClick={() => { setTab('login'); setGoogleError(''); }}>Log in Now</button>
            </div>

            {GOOGLE_CLIENT_ID && (
              <>
                <div className="auth-modal-divider">Or, sign up with</div>
                {googleError && (
                  <div className="auth-modal-google-error">
                    <FiAlertCircle /> {googleError}
                  </div>
                )}
                <div className="auth-modal-social">
                  <button type="button" className="auth-modal-social-btn" onClick={() => handleGoogleSignIn()} disabled={googleLoading}>
                    {googleLoading ? <span className="auth-modal-loader" /> : <><GoogleIcon /> Google</>}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* ════════ SIGN-UP STEP 2: OTP Verification ════════ */}
        {tab === 'signup' && signupStep === 2 && (
          <div>
            <div className="auth-modal-step-header">
              <FiMail className="auth-modal-step-icon" />
              <h3>Check Your Email</h3>
              <p>We sent a 6-digit code to<br /><strong>{signupData.email}</strong></p>
            </div>

            <div className="auth-modal-otp-wrap" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`auth-modal-otp-input ${digit ? 'filled' : ''}`}
                  disabled={otpLoading}
                />
              ))}
            </div>

            <div className="auth-modal-otp-resend">
              {otpSendCount >= 3 ? (
                <span className="auth-modal-otp-limit">OTP send limit reached (3/3). Please try again later.</span>
              ) : !canResend ? (
                <span>Resend code in <strong>{countdown}s</strong> ({otpSendCount}/3)</span>
              ) : (
                <button type="button" onClick={handleResendOtp} disabled={resending} className="auth-modal-resend-btn">
                  {resending ? <span className="auth-modal-loader" /> : <><FiRefreshCw /> Resend Code ({otpSendCount}/3)</>}
                </button>
              )}
            </div>

            <button type="button" className="auth-modal-submit" onClick={handleVerifyOtp}
              disabled={otpLoading || otp.some((d) => d === '')}>
              {otpLoading ? <span className="auth-modal-loader" /> : <>Verify Code <FiArrowRight /></>}
            </button>

            <button type="button" className="auth-modal-back-btn" onClick={() => setSignupStep(1)}>
              ← Use different email
            </button>
          </div>
        )}

        {/* ════════ SIGN-UP STEP 3: Set Password ════════ */}
        {tab === 'signup' && signupStep === 3 && (
          <form onSubmit={handleCreateAccount} noValidate>
            <div className="auth-modal-step-header">
              <FiLock className="auth-modal-step-icon" />
              <h3>Set Your Password</h3>
              <p>Create a secure password for your account</p>
            </div>

            <div className="auth-modal-field">
              <label>Password</label>
              <div className="auth-modal-input-wrap">
                <FiLock className="field-icon" />
                <input type={showPw ? 'text' : 'password'} name="password"
                  placeholder="Min. 6 characters" value={pwData.password}
                  onChange={handlePwChange} />
                <button type="button" className="auth-modal-toggle-pw" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {pwErrors.password && <span className="auth-modal-field-error"><FiAlertCircle /> {pwErrors.password}</span>}
            </div>

            <div className="auth-modal-field">
              <label>Confirm Password</label>
              <div className="auth-modal-input-wrap">
                <FiLock className="field-icon" />
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                  placeholder="Re-enter your password" value={pwData.confirmPassword}
                  onChange={handlePwChange} />
                <button type="button" className="auth-modal-toggle-pw" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {pwErrors.confirmPassword && <span className="auth-modal-field-error"><FiAlertCircle /> {pwErrors.confirmPassword}</span>}
              {pwData.confirmPassword && pwData.password === pwData.confirmPassword && (
                <span className="auth-modal-field-success"><FiCheckCircle /> Passwords match!</span>
              )}
            </div>

            <div className="auth-modal-pw-reqs">
              {[
                { met: pwData.password.length >= 6, text: 'At least 6 characters' },
                { met: /[A-Z]/.test(pwData.password), text: 'One uppercase letter' },
                { met: /[0-9]/.test(pwData.password), text: 'One number' },
              ].map((r, i) => (
                <div key={i} className={`auth-modal-req ${r.met ? 'met' : ''}`}>
                  <FiCheckCircle /> <span>{r.text}</span>
                </div>
              ))}
            </div>

            <button type="submit" className="auth-modal-submit" disabled={pwLoading}>
              {pwLoading ? <span className="auth-modal-loader" /> : <>Create My Account <FiArrowRight /></>}
            </button>
          </form>
        )}

        {/* ════════ SIGN-UP STEP 4: Import Profile Photo (Manual signup only) ════════ */}
        {tab === 'signup' && signupStep === 4 && (
          <div>
            <div className="auth-modal-step-header">
              <FiCheckCircle className="auth-modal-step-icon" style={{ color: '#22c55e' }} />
              <h3>Account Created!</h3>
              <p>Would you like to add a profile photo from your Google account?</p>
            </div>

            <div className="auth-modal-social">
              <button type="button" className="auth-modal-social-btn" onClick={() => handleGoogleLink()} disabled={linkLoading}>
                {linkLoading ? <span className="auth-modal-loader" /> : <><GoogleIcon /> Import Google Photo</>}
              </button>
            </div>

            <button type="button" className="auth-modal-skip-btn" onClick={onClose}>
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;
