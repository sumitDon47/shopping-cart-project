import React from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiCheckCircle, FiClock } from 'react-icons/fi';
import './Profile.css';

const Field = ({ icon, label, value }) => (
  <div className="pv-field">
    <span className="pv-field-icon">{icon}</span>
    <div>
      <p className="pv-field-label">{label}</p>
      <p className="pv-field-value">{value || <span className="pv-field-empty">Not provided</span>}</p>
    </div>
  </div>
);

const ProfileView = ({ profile, onEdit }) => {
  if (!profile) return null;

  const address = profile.address
    ? [profile.address.street, profile.address.city, profile.address.state, profile.address.zipCode, profile.address.country]
        .filter(Boolean).join(', ')
    : null;

  return (
    <div className="pv-card fade-in-up">
      {/* Header */}
      <div className="pv-header">
        <div>
          <h2 className="pv-title">My Profile</h2>
          <p className="pv-subtitle">Your personal information</p>
        </div>
        <button onClick={onEdit} className="pv-edit-btn">
          <FiEdit2 /> Edit Profile
        </button>
      </div>

      {/* Verification banner */}
      <div className={`pv-banner ${profile.isEmailVerified ? 'verified' : 'unverified'}`}>
        {profile.isEmailVerified ? (
          <><FiCheckCircle /> Email verified — your account is fully active.</>
        ) : (
          <><FiClock /> Email not verified. Please check your inbox.</>
        )}
      </div>

      {/* Info */}
      <div className="pv-section">
        <h3 className="pv-section-title">Personal Information</h3>
        <div className="pv-fields">
          <Field icon={<FiUser />}  label="Full Name" value={profile.name} />
          <Field icon={<FiMail />}  label="Email Address" value={profile.email} />
          <Field icon={<FiPhone />} label="Phone Number" value={profile.phone} />
        </div>
      </div>

      <div className="pv-divider" />

      <div className="pv-section">
        <h3 className="pv-section-title">Address</h3>
        <div className="pv-fields">
          <Field icon={<FiMapPin />} label="Full Address" value={address} />
          {profile.address && (
            <>
              <Field icon={<FiMapPin />} label="City"    value={profile.address.city} />
              <Field icon={<FiMapPin />} label="Country" value={profile.address.country} />
            </>
          )}
        </div>
      </div>

      {/* Account details */}
      <div className="pv-divider" />
      <div className="pv-meta">
        <div className="pv-meta-item">
          <span className="pv-meta-label">Account Type</span>
          <span className={`pv-meta-badge ${profile.role}`}>{profile.role}</span>
        </div>
        {profile.createdAt && (
          <div className="pv-meta-item">
            <span className="pv-meta-label">Member Since</span>
            <span className="pv-meta-value">{new Date(profile.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
