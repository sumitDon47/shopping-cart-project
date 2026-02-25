import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiShield } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

const ChangePassword = ({ onSuccess }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);

  const calcStrength = (p) => {
    let s = 0;
    if (p.length >= 6)   s++;
    if (p.length >= 10)  s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    setStrength(s);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'newPassword') calcStrength(value);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required';
    if (!form.newPassword) errs.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) errs.newPassword = 'Minimum 6 characters';
    else if (!/(?=.*[A-Z])/.test(form.newPassword)) errs.newPassword = 'Must include uppercase letter';
    else if (!/(?=.*[0-9])/.test(form.newPassword)) errs.newPassword = 'Must include a number';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (form.currentPassword === form.newPassword) errs.newPassword = 'New password must differ from current';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.updateProfile({ password: form.newPassword });
      toast.success('Password changed successfully! 🔒');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStrength(0);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  const PasswordField = ({ name, label, showKey, value }) => (
    <div className={`pe-field ${errors[name] ? 'has-error' : ''}`}>
      <label className="pe-label">{label}</label>
      <div className="pe-input-wrap">
        <span className="pe-icon"><FiLock /></span>
        <input
          type={show[showKey] ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleChange}
          className="pe-input"
          placeholder="••••••••"
        />
        <button type="button" className="pe-toggle" onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))}>
          {show[showKey] ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {errors[name] && <span className="pe-error"><FiAlertCircle />{errors[name]}</span>}
    </div>
  );

  return (
    <div className="pe-card fade-in-up">
      <div className="pv-header">
        <div>
          <h2 className="pv-title">Change Password</h2>
          <p className="pv-subtitle">Keep your account secure with a strong password</p>
        </div>
        <div className="cp-shield-icon"><FiShield /></div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="pe-section">
          <div className="pe-grid cp-grid">
            <PasswordField name="currentPassword" label="Current Password" showKey="current" value={form.currentPassword} />
            <PasswordField name="newPassword"     label="New Password"     showKey="newPass" value={form.newPassword} />

            {/* Strength meter */}
            {form.newPassword && (
              <div className="cp-strength" style={{ gridColumn: 'span 2' }}>
                <div className="cp-bars">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="cp-bar" style={{ background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <span className="cp-label" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
              </div>
            )}

            {/* Requirements */}
            <div className="cp-requirements" style={{ gridColumn: 'span 2' }}>
              {[
                { met: form.newPassword.length >= 6,          text: 'At least 6 characters' },
                { met: /[A-Z]/.test(form.newPassword),        text: 'One uppercase letter'  },
                { met: /[0-9]/.test(form.newPassword),        text: 'One number'            },
                { met: form.newPassword !== form.currentPassword && !!form.newPassword, text: 'Different from current password' },
              ].map(({ met, text }) => (
                <div key={text} className={`cp-req ${met ? 'met' : ''}`}>
                  <FiCheckCircle /> {text}
                </div>
              ))}
            </div>

            <PasswordField name="confirmPassword" label="Confirm New Password" showKey="confirm" value={form.confirmPassword} />
          </div>
        </div>

        <div className="pe-actions">
          <button type="submit" className="pe-save-btn" disabled={loading}>
            {loading ? <span className="pe-loader" /> : <><FiLock /> Update Password</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
