// Profile page with full CRUD — component lives in components/profile/
// This file acts as the route-level wrapper and orchestrator.

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../redux/slices/authSlice';
import { fetchProfileStart, fetchProfileSuccess, fetchProfileFailure, updateProfileStart, updateProfileSuccess, updateProfileFailure } from '../../redux/slices/userSlice';
import { userAPI } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { PageLoader } from '../../components/common/Loader';
import ProfileView from '../../components/profile/ProfileView';
import ProfileEdit from '../../components/profile/ProfileEdit';
import ChangePassword from '../../components/profile/ChangePassword';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const TABS = ['profile', 'edit', 'password'];

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user }              = useSelector((s) => s.auth);
  const { profile, loading }  = useSelector((s) => s.user);
  const [activeTab, setActiveTab] = useState('profile');

  /* Fetch profile on mount */
  useEffect(() => {
    const loadProfile = async () => {
      dispatch(fetchProfileStart());
      try {
        const res = await userAPI.getProfile();
        dispatch(fetchProfileSuccess(res.data.data));
      } catch (err) {
        dispatch(fetchProfileFailure(err.response?.data?.message || 'Failed to load profile'));
        toast.error('Could not load profile');
      }
    };
    loadProfile();
  }, [dispatch]);

  /* Update profile handler (passed down to ProfileEdit) */
  const handleUpdateProfile = async (formData) => {
    dispatch(updateProfileStart());
    try {
      const res = await userAPI.updateProfile(formData);
      dispatch(updateProfileSuccess(res.data.data));
      dispatch(updateUser(res.data.data));
      toast.success('Profile updated successfully! ✨');
      setActiveTab('profile');
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      dispatch(updateProfileFailure(msg));
      toast.error(msg);
    }
  };

  if (loading && !profile) return <><Navbar /><PageLoader text="Loading profile..." /></>;

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-main">
        <div className="profile-inner">

          {/* ── Sidebar ─────────────────────────────────── */}
          <aside className="profile-sidebar">
            {/* Avatar */}
            <div className="profile-sidebar-avatar">
              <div className="profile-big-avatar">
                {profile?.name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <h2 className="profile-sidebar-name">{profile?.name || user?.name}</h2>
              <p className="profile-sidebar-email">{profile?.email || user?.email}</p>
              <span className={`profile-role-badge ${profile?.role || user?.role}`}>
                {profile?.role || user?.role}
              </span>
            </div>

            {/* Nav */}
            <nav className="profile-sidebar-nav">
              {[
                { key: 'profile',  label: '👤  My Profile'       },
                { key: 'edit',     label: '✏️  Edit Profile'     },
                { key: 'password', label: '🔒  Change Password'  },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`profile-nav-btn ${activeTab === key ? 'active' : ''}`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Member since */}
            {profile?.createdAt && (
              <p className="profile-member-since">
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </aside>

          {/* ── Main Content ─────────────────────────────── */}
          <div className="profile-content">
            {activeTab === 'profile'  && <ProfileView  profile={profile || user} onEdit={() => setActiveTab('edit')} />}
            {activeTab === 'edit'     && <ProfileEdit  profile={profile || user} onSave={handleUpdateProfile} onCancel={() => setActiveTab('profile')} loading={loading} />}
            {activeTab === 'password' && <ChangePassword onSuccess={() => setActiveTab('profile')} />}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
