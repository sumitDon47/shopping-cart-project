import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import { ROUTES } from '../../utils/constants';
import {
  FiBarChart2, FiBox, FiUsers, FiCreditCard, FiPackage,
  FiLogOut, FiChevronDown, FiUser,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminHeader = ({ title, gradient, subtitle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    toast.success('Logged out successfully');
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="admin-header">
      <div>
        <h1 className="admin-title">
          {title} <span className="admin-gradient">{gradient}</span>
        </h1>
        <p className="admin-subtitle">{subtitle}</p>
      </div>
      <div className="admin-header-right">
        <nav className="admin-nav">
          <Link to={ROUTES.ADMIN_DASHBOARD} className={`admin-nav-btn ${location.pathname === ROUTES.ADMIN_DASHBOARD ? 'active' : ''}`}>
            <FiBarChart2 /> Overview
          </Link>
          <Link to={ROUTES.ADMIN_PRODUCTS} className={`admin-nav-btn ${location.pathname === ROUTES.ADMIN_PRODUCTS ? 'active' : ''}`}>
            <FiBox /> Products
          </Link>
          <Link to={ROUTES.ADMIN_USERS} className={`admin-nav-btn ${location.pathname === ROUTES.ADMIN_USERS ? 'active' : ''}`}>
            <FiUsers /> Users
          </Link>
          <Link to={ROUTES.ADMIN_PAYMENTS} className={`admin-nav-btn ${location.pathname === ROUTES.ADMIN_PAYMENTS ? 'active' : ''}`}>
            <FiCreditCard /> Payments
          </Link>
          <Link to={ROUTES.ADMIN_ORDERS} className={`admin-nav-btn ${location.pathname === ROUTES.ADMIN_ORDERS ? 'active' : ''}`}>
            <FiPackage /> Orders
          </Link>
        </nav>
        <div className="admin-user-menu" ref={menuRef}>
          <button
            className="admin-user-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="admin-avatar">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <FiChevronDown className={`admin-chevron ${menuOpen ? 'open' : ''}`} />
          </button>
          {menuOpen && (
            <div className="admin-user-dropdown">
              <div className="admin-user-info">
                <p className="admin-user-name">{user?.name}</p>
                <p className="admin-user-email">{user?.email}</p>
              </div>
              <div className="admin-user-actions">
                <Link
                  to={ROUTES.PROFILE}
                  className="admin-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <FiUser /> Profile
                </Link>
                <button className="admin-dropdown-item signout" onClick={handleLogout}>
                  <FiLogOut /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
