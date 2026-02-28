import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import { ROUTES } from '../../utils/constants';
import {
  FiShoppingBag, FiUser, FiShoppingCart, FiLogOut,
  FiMenu, FiX, FiSettings, FiPackage, FiChevronDown, FiBox, FiUsers,
  FiSun, FiMoon,
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const dispatch   = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { totalItems: cartCount } = useSelector((s) => s.cart);
  const { theme, toggleTheme, isDark } = useTheme();

  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    toast.success('Logged out successfully');
    navigate(ROUTES.LOGIN);
  };

  const isActive = (path) => location.pathname === path;

  const isAdmin = isAuthenticated && user?.role === 'admin';

  const navLinks = [
    ...(!isAdmin ? [{ label: 'Home', path: ROUTES.HOME }] : []),
    ...(!isAdmin ? [{ label: 'Products', path: ROUTES.PRODUCTS }] : []),
    ...(!isAdmin ? (isAuthenticated ? [{ label: 'Orders', path: ROUTES.ORDERS }] : []) : []),
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">

        {/* ── Brand ──────────────────────────────────── */}
        <Link to={ROUTES.HOME} className="navbar-brand">
          <span className="navbar-logo-icon"><FiShoppingBag /></span>
          <span className="navbar-logo-text">ShopCart</span>
        </Link>

        {/* ── Desktop Nav Links ───────────────────────── */}
        <ul className="navbar-links">
          {navLinks.map(({ label, path }) => (
            <li key={path}>
              <Link to={path} className={`navbar-link ${isActive(path) ? 'active' : ''}`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Desktop Actions ─────────────────────────── */}
        <div className="navbar-actions">

          {isAuthenticated ? (
            <>
              {/* Cart — hidden for admin */}
              {user?.role !== 'admin' && (
                <Link to={ROUTES.CART} className="navbar-icon-btn" aria-label="Cart">
                  <FiShoppingCart />
                  {cartCount > 0 && <span className="navbar-cart-badge">{cartCount}</span>}
                </Link>
              )}

              {/* User Dropdown */}
              <div className="navbar-dropdown" ref={dropdownRef}>
                <button
                  className="navbar-user-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="navbar-avatar">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="navbar-user-name">{user?.name?.split(' ')[0]}</span>
                  <FiChevronDown className={`navbar-chevron ${dropdownOpen ? 'open' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="navbar-dropdown-menu">
                    <div className="navbar-dropdown-header">
                      <p className="navbar-dropdown-name">{user?.name}</p>
                      <p className="navbar-dropdown-email">{user?.email}</p>
                      <span className={`navbar-role-badge ${user?.role}`}>{user?.role}</span>
                    </div>

                    <div className="navbar-dropdown-items">
                      <Link to={ROUTES.PROFILE} className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <FiUser /> My Profile
                      </Link>
                      {user?.role !== 'admin' && (
                        <Link to={ROUTES.ORDERS} className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <FiPackage /> My Orders
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <>
                          <Link to={ROUTES.ADMIN_DASHBOARD} className="navbar-dropdown-item admin" onClick={() => setDropdownOpen(false)}>
                            <FiSettings /> Admin Dashboard
                          </Link>
                          <Link to={ROUTES.ADMIN_PRODUCTS} className="navbar-dropdown-item admin" onClick={() => setDropdownOpen(false)}>
                            <FiBox /> Manage Products
                          </Link>
                          <Link to={ROUTES.ADMIN_USERS} className="navbar-dropdown-item admin" onClick={() => setDropdownOpen(false)}>
                            <FiUsers /> Manage Users
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="navbar-dropdown-footer">
                      <div className="navbar-dropdown-item theme-row" onClick={toggleTheme}>
                        {isDark ? <FiMoon /> : <FiSun />} Theme
                        <div className={`navbar-theme-switch ${isDark ? 'dark' : ''}`}>
                          <div className="navbar-theme-switch-knob" />
                        </div>
                      </div>
                      <button className="navbar-logout-btn" onClick={handleLogout}>
                        <FiLogOut /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                className="navbar-theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                <span className={`theme-icon-wrap ${isDark ? 'dark' : 'light'}`}>
                  {isDark ? <FiMoon /> : <FiSun />}
                </span>
              </button>
              <Link to={ROUTES.LOGIN}    className="navbar-btn-ghost">Sign In</Link>
              <Link to={ROUTES.REGISTER} className="navbar-btn-primary">Get Started</Link>
            </>
          )}
        </div>

        {/* ── Mobile Hamburger ────────────────────────── */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* ── Mobile Menu ─────────────────────────────── */}
      <div className={`navbar-mobile ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map(({ label, path }) => (
          <Link
            key={path}
            to={path}
            className={`navbar-mobile-link ${isActive(path) ? 'active' : ''}`}
          >
            {label}
          </Link>
        ))}

        <div className="navbar-mobile-divider" />

        {isAuthenticated ? (
          <>
            <div className="navbar-mobile-user">
              <div className="navbar-avatar large">{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <p className="navbar-mobile-user-name">{user?.name}</p>
                <p className="navbar-mobile-user-email">{user?.email}</p>
              </div>
            </div>
            <Link to={ROUTES.PROFILE} className="navbar-mobile-link"><FiUser /> Profile</Link>
            {user?.role !== 'admin' && (
              <Link to={ROUTES.CART}    className="navbar-mobile-link"><FiShoppingCart /> Cart</Link>
            )}
            {user?.role === 'admin' && (
              <Link to={ROUTES.ADMIN_DASHBOARD} className="navbar-mobile-link"><FiSettings /> Admin</Link>
            )}
            <button className="navbar-mobile-logout" onClick={handleLogout}>
              <FiLogOut /> Sign Out
            </button>
            <div className="navbar-mobile-link theme-row" onClick={toggleTheme} style={{ cursor: 'pointer' }}>
              {isDark ? <FiMoon /> : <FiSun />} Theme
              <div className={`navbar-theme-switch ${isDark ? 'dark' : ''}`}>
                <div className="navbar-theme-switch-knob" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="navbar-mobile-link theme-row" onClick={toggleTheme} style={{ cursor: 'pointer' }}>
              {isDark ? <FiMoon /> : <FiSun />} Theme
              <div className={`navbar-theme-switch ${isDark ? 'dark' : ''}`}>
                <div className="navbar-theme-switch-knob" />
              </div>
            </div>
            <Link to={ROUTES.LOGIN}    className="navbar-mobile-link">Sign In</Link>
            <Link to={ROUTES.REGISTER} className="navbar-mobile-btn">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
