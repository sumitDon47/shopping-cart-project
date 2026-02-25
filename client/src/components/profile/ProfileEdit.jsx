import React, { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMapPin, FiSave, FiX, FiAlertCircle } from 'react-icons/fi';
import './Profile.css';

const ProfileEdit = ({ profile, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '', phone: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
  });
  const [errors, setErrors] = useState({});

  /* Seed form with current profile */
  useEffect(() => {
    if (profile) {
      setFormData({
        name:  profile.name  || '',
        phone: profile.phone || '',
        address: {
          street:  profile.address?.street  || '',
          city:    profile.address?.city    || '',
          state:   profile.address?.state   || '',
          zipCode: profile.address?.zipCode || '',
          country: profile.address?.country || '',
        },
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({ ...prev, address: { ...prev.address, [key]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <div className="pe-card fade-in-up">
      <div className="pv-header">
        <div>
          <h2 className="pv-title">Edit Profile</h2>
          <p className="pv-subtitle">Update your personal information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Personal Info ─────────────────────────────── */}
        <div className="pe-section">
          <h3 className="pv-section-title">Personal Information</h3>
          <div className="pe-grid">

            {/* Name */}
            <div className={`pe-field ${errors.name ? 'has-error' : ''}`}>
              <label className="pe-label">Full Name *</label>
              <div className="pe-input-wrap">
                <span className="pe-icon"><FiUser /></span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pe-input"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <span className="pe-error"><FiAlertCircle />{errors.name}</span>}
            </div>

            {/* Phone */}
            <div className="pe-field">
              <label className="pe-label">Phone Number</label>
              <div className="pe-input-wrap">
                <span className="pe-icon"><FiPhone /></span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pe-input"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pv-divider" />

        {/* ── Address ───────────────────────────────────── */}
        <div className="pe-section">
          <h3 className="pv-section-title">Address</h3>
          <div className="pe-grid">

            {[
              { name: 'address.street',  label: 'Street Address', placeholder: '123 Main St',    span: 2 },
              { name: 'address.city',    label: 'City',           placeholder: 'New York'              },
              { name: 'address.state',   label: 'State / Region', placeholder: 'NY'                    },
              { name: 'address.zipCode', label: 'ZIP / Postal',   placeholder: '10001'                 },
              { name: 'address.country', label: 'Country',        placeholder: 'United States'         },
            ].map(({ name, label, placeholder, span }) => {
              const value = name.startsWith('address.')
                ? formData.address[name.split('.')[1]]
                : formData[name];
              return (
                <div key={name} className="pe-field" style={span ? { gridColumn: `span ${span}` } : {}}>
                  <label className="pe-label">{label}</label>
                  <div className="pe-input-wrap">
                    <span className="pe-icon"><FiMapPin /></span>
                    <input
                      type="text"
                      name={name}
                      value={value}
                      onChange={handleChange}
                      className="pe-input"
                      placeholder={placeholder}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────── */}
        <div className="pe-actions">
          <button type="button" onClick={onCancel} className="pe-cancel-btn" disabled={loading}>
            <FiX /> Cancel
          </button>
          <button type="submit" className="pe-save-btn" disabled={loading}>
            {loading
              ? <span className="pe-loader" />
              : <><FiSave /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
