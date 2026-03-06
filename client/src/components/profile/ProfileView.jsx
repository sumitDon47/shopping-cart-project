import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiCheckCircle, FiClock, FiCamera } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import { updateUser } from '../../redux/slices/authSlice';
import { GOOGLE_CLIENT_ID } from '../../utils/constants';
import toast from 'react-hot-toast';
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
  const dispatch = useDispatch();
  const [linkLoading, setLinkLoading] = useState(false);

  const handleGoogleLink = () => {
    const sdk = window?.google?.accounts?.oauth2;
    if (!sdk || !GOOGLE_CLIENT_ID) {
      toast.error('Google sign-in is not available');
      return;
    }
    const client = sdk.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid profile email',
      callback: async (response) => {
        if (response.error) { toast.error('Google link was cancelled'); return; }
        setLinkLoading(true);
        try {
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` },
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
        }
      },
      error_callback: () => toast.error('Google link was cancelled'),
    });
    client.requestAccessToken();
  };

  if (!profile) return null;

  const address = profile.address
    ? [profile.address.street, profile.address.city, profile.address.state, profile.address.zipCode, profile.address.country]
        .filter(Boolean).join(', ')
    : null;

  return (
    <div className="pv-card fade-in-up">
      {/* Header */}
      <div className="pv-header">
        <div className="pv-header-left">
          <div className="pv-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="pv-avatar-img" referrerPolicy="no-referrer" />
            ) : (
              <span className="pv-avatar-initial">{profile.name?.[0]?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <div>
            <h2 className="pv-title">My Profile</h2>
            <p className="pv-subtitle">Your personal information</p>
          </div>
        </div>
        <button onClick={onEdit} className="pv-edit-btn">
          <FiEdit2 /> Edit Profile
        </button>
      </div>

      {/* Google profile photo link */}
      {!profile.avatar && GOOGLE_CLIENT_ID && (
        <button className="pv-google-link-btn" onClick={() => handleGoogleLink()} disabled={linkLoading}>
          <FiCamera /> {linkLoading ? 'Importing...' : 'Import Profile Photo from Google'}
        </button>
      )}

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
