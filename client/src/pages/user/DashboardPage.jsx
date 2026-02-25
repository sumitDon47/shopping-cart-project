import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { FiPackage, FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import './DashboardPage.css';

const statCards = [
  { icon: <FiPackage />,     label: 'Orders',      value: '0', color: '#7c3aed' },
  { icon: <FiShoppingCart />,label: 'Cart Items',  value: '0', color: '#2563eb' },
  { icon: <FiHeart />,       label: 'Wishlist',    value: '0', color: '#db2777' },
  { icon: <FiStar />,        label: 'Reviews',     value: '0', color: '#d97706' },
];

const DashboardPage = () => {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-inner">

          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">
                Welcome back, <span className="dashboard-name">{user?.name?.split(' ')[0]}!</span>
              </h1>
              <p className="dashboard-subtitle">Here's what's happening with your account.</p>
            </div>
            <Link to={ROUTES.PRODUCTS} className="dashboard-shop-btn">
              Start Shopping
            </Link>
          </div>

          {/* Stats */}
          <div className="dashboard-stats">
            {statCards.map(({ icon, label, value, color }) => (
              <div className="dashboard-stat-card" key={label}>
                <div className="dashboard-stat-icon" style={{ '--stat-color': color }}>{icon}</div>
                <div>
                  <p className="dashboard-stat-value">{value}</p>
                  <p className="dashboard-stat-label">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Coming soon */}
          <div className="dashboard-coming-soon">
            <div className="dashboard-cs-icon">🚀</div>
            <h3>Full Dashboard Coming Soon</h3>
            <p>Order history, analytics, and more will appear here.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
