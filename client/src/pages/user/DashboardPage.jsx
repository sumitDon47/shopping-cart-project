import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../../redux/slices/cartSlice';
import { orderAPI } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  FiPackage, FiShoppingCart, FiUser, FiArrowRight,
  FiClock, FiCheckCircle, FiTruck, FiShoppingBag,
  FiSettings, FiHelpCircle
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import './DashboardPage.css';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { totalItems: cartCount } = useSelector((s) => s.cart);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    dispatch(fetchCart());
    const loadOrders = async () => {
      try {
        const res = await orderAPI.getMyOrders();
        setOrders(res.data || []);
      } catch {
        /* silently fail — dashboard still shows */
      }
    };
    loadOrders();
  }, [dispatch]);

  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o) => o.status === 'pending' || o.status === 'processing')?.length || 0;
  const deliveredOrders = orders?.filter((o) => o.status === 'delivered')?.length || 0;

  const statCards = [
    { icon: <FiPackage />,       label: 'Total Orders',    value: totalOrders,    color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
    { icon: <FiShoppingCart />,  label: 'Cart Items',      value: cartCount,      color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
    { icon: <FiClock />,         label: 'In Progress',     value: pendingOrders,  color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
    { icon: <FiCheckCircle />,   label: 'Delivered',       value: deliveredOrders, color: '#059669', bg: 'rgba(5,150,105,0.12)' },
  ];

  const quickActions = [
    { icon: <FiShoppingBag />, label: 'Browse Products', desc: 'Explore our catalog',        path: ROUTES.PRODUCTS, color: '#7c3aed' },
    { icon: <FiShoppingCart />,label: 'View Cart',       desc: `${cartCount} items in cart`,  path: ROUTES.CART,     color: '#2563eb' },
    { icon: <FiPackage />,     label: 'My Orders',       desc: 'Track your orders',           path: ROUTES.ORDERS,   color: '#d97706' },
    { icon: <FiUser />,        label: 'My Profile',      desc: 'Manage your account',         path: ROUTES.PROFILE,  color: '#059669' },
  ];

  const recentOrders = orders?.slice(0, 4) || [];

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-inner">

          {/* ── Header ──────────────────────────────────── */}
          <section className="dashboard-header">
            <div className="dashboard-header-left">
              <div className="dashboard-avatar-wrap">
                <div className="dashboard-avatar">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="dashboard-avatar-status" />
              </div>
              <div>
                <p className="dashboard-greeting">{getGreeting()},</p>
                <h1 className="dashboard-title">{user?.name || 'User'}</h1>
                <p className="dashboard-subtitle">Here's an overview of your account activity.</p>
              </div>
            </div>
            <Link to={ROUTES.PRODUCTS} className="dashboard-shop-btn">
              <FiShoppingBag /> Start Shopping
            </Link>
          </section>

          {/* ── Stats ───────────────────────────────────── */}
          <section className="dashboard-stats">
            {statCards.map(({ icon, label, value, color, bg }) => (
              <div className="dashboard-stat-card" key={label}>
                <div className="dashboard-stat-icon" style={{ background: bg, color }}>
                  {icon}
                </div>
                <div className="dashboard-stat-info">
                  <p className="dashboard-stat-value">{value}</p>
                  <p className="dashboard-stat-label">{label}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ── Quick Actions + Recent Orders ───────────── */}
          <div className="dashboard-grid">
            {/* Quick Actions */}
            <section className="dashboard-section">
              <div className="dashboard-section-head">
                <h2 className="dashboard-section-title">Quick Actions</h2>
              </div>
              <div className="dashboard-actions">
                {quickActions.map(({ icon, label, desc, path, color }) => (
                  <Link to={path} className="dashboard-action-card" key={label}>
                    <div className="dashboard-action-icon" style={{ '--action-color': color }}>
                      {icon}
                    </div>
                    <div className="dashboard-action-text">
                      <p className="dashboard-action-label">{label}</p>
                      <p className="dashboard-action-desc">{desc}</p>
                    </div>
                    <FiArrowRight className="dashboard-action-arrow" />
                  </Link>
                ))}
              </div>
            </section>

            {/* Recent Orders */}
            <section className="dashboard-section">
              <div className="dashboard-section-head">
                <h2 className="dashboard-section-title">Recent Orders</h2>
                {totalOrders > 0 && (
                  <Link to={ROUTES.ORDERS} className="dashboard-see-all">
                    View all <FiArrowRight />
                  </Link>
                )}
              </div>

              {recentOrders.length > 0 ? (
                <div className="dashboard-orders-list">
                  {recentOrders.map((order) => (
                    <Link
                      to={`/orders/${order._id}`}
                      className="dashboard-order-row"
                      key={order._id}
                    >
                      <div className="dashboard-order-icon">
                        {order.status === 'delivered' ? <FiCheckCircle /> : order.status === 'shipped' ? <FiTruck /> : <FiClock />}
                      </div>
                      <div className="dashboard-order-info">
                        <p className="dashboard-order-id">
                          #{order._id?.slice(-8).toUpperCase()}
                        </p>
                        <p className="dashboard-order-date">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`dashboard-order-status status-${order.status}`}>
                        {order.status}
                      </span>
                      <p className="dashboard-order-total">
                        Rs. {order.totalAmount?.toLocaleString()}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty">
                  <div className="dashboard-empty-icon"><FiPackage /></div>
                  <p className="dashboard-empty-title">No orders yet</p>
                  <p className="dashboard-empty-desc">Your order history will appear here.</p>
                  <Link to={ROUTES.PRODUCTS} className="dashboard-empty-btn">
                    Browse Products <FiArrowRight />
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* ── Account Help ────────────────────────────── */}
          <section className="dashboard-footer-cards">
            <div className="dashboard-help-card">
              <FiSettings className="dashboard-help-ic" />
              <div>
                <p className="dashboard-help-title">Account Settings</p>
                <p className="dashboard-help-desc">Update profile, change password, and more.</p>
              </div>
              <Link to={ROUTES.PROFILE} className="dashboard-help-link">Manage <FiArrowRight /></Link>
            </div>
            <div className="dashboard-help-card">
              <FiHelpCircle className="dashboard-help-ic" />
              <div>
                <p className="dashboard-help-title">Need Help?</p>
                <p className="dashboard-help-desc">Contact our support team anytime.</p>
              </div>
              <a href="mailto:support@shopcart.com" className="dashboard-help-link">Contact <FiArrowRight /></a>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
