import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { ROUTES } from '../../utils/constants';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  FiUsers, FiShoppingBag, FiPackage, FiDollarSign,
  FiTrendingUp, FiBarChart2, FiActivity, FiBox,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = stats?.monthlySales
    ? Math.max(...stats.monthlySales.map((m) => m.revenue), 1)
    : 1;

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-main">
        <div className="admin-inner">

          {/* ── Header ───────────────────────────────────── */}
          <div className="admin-header">
            <div>
              <h1 className="admin-title">
                Admin <span className="admin-gradient">Dashboard</span>
              </h1>
              <p className="admin-subtitle">Monitor sales, users, and inventory at a glance</p>
            </div>
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
            </nav>
          </div>

          {loading ? (
            <div className="admin-loader"><div className="admin-spinner" /></div>
          ) : stats ? (
            <>
              {/* ── Stat Cards ────────────────────────────── */}
              <div className="admin-stats">
                <div className="admin-stat-card" style={{ '--stat-color': '#a855f7' }}>
                  <div className="admin-stat-icon"><FiDollarSign /></div>
                  <div>
                    <div className="admin-stat-value">${stats.totalRevenue.toFixed(2)}</div>
                    <div className="admin-stat-label">Total Revenue</div>
                  </div>
                </div>
                <div className="admin-stat-card" style={{ '--stat-color': '#3b82f6' }}>
                  <div className="admin-stat-icon"><FiPackage /></div>
                  <div>
                    <div className="admin-stat-value">{stats.totalOrders}</div>
                    <div className="admin-stat-label">Total Orders</div>
                  </div>
                </div>
                <div className="admin-stat-card" style={{ '--stat-color': '#10b981' }}>
                  <div className="admin-stat-icon"><FiUsers /></div>
                  <div>
                    <div className="admin-stat-value">{stats.totalUsers}</div>
                    <div className="admin-stat-label">Total Users</div>
                  </div>
                </div>
                <div className="admin-stat-card" style={{ '--stat-color': '#f59e0b' }}>
                  <div className="admin-stat-icon"><FiShoppingBag /></div>
                  <div>
                    <div className="admin-stat-value">{stats.totalProducts}</div>
                    <div className="admin-stat-label">Products</div>
                  </div>
                </div>
              </div>

              {/* ── Today's Sales ─────────────────────────── */}
              <div className="admin-today">
                <div className="admin-today-card">
                  <h4><FiTrendingUp style={{ verticalAlign: 'middle', marginRight: 6 }} /> Today's Revenue</h4>
                  <div className="admin-today-value">${stats.todaySales.revenue.toFixed(2)}</div>
                </div>
                <div className="admin-today-card">
                  <h4><FiActivity style={{ verticalAlign: 'middle', marginRight: 6 }} /> Today's Orders</h4>
                  <div className="admin-today-value">{stats.todaySales.count}</div>
                </div>
              </div>

              {/* ── Monthly Sales Chart ───────────────────── */}
              <div className="admin-chart-section">
                <div className="admin-card">
                  <h3 className="admin-card-title">Monthly Sales (Last 12 Months)</h3>
                  <div className="admin-chart">
                    {stats.monthlySales.map((m, i) => (
                      <div className="admin-bar-wrapper" key={i}>
                        <div
                          className="admin-bar"
                          style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                        >
                          <div className="admin-bar-tooltip">
                            ${m.revenue.toFixed(0)} · {m.orders} orders
                          </div>
                        </div>
                        <span className="admin-bar-label">{m.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Order Status Breakdown ────────────────── */}
              <div className="admin-status-grid">
                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <div className="admin-status-chip" key={s}>
                    <div className="admin-status-chip-count">{stats.ordersByStatus[s] || 0}</div>
                    <div className="admin-status-chip-label">{s}</div>
                  </div>
                ))}
              </div>

              {/* ── Recent Orders Table ───────────────────── */}
              <div className="admin-card">
                <h3 className="admin-card-title">Recent Orders</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </td>
                          <td>{order.user?.name || 'Unknown'}</td>
                          <td style={{ fontWeight: 600, color: '#fff' }}>${order.totalPrice.toFixed(2)}</td>
                          <td><span className={`admin-status ${order.status}`}>{order.status}</span></td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {stats.recentOrders.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>No orders yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="admin-empty">
              <div className="admin-empty-icon">📊</div>
              <h3>Could not load stats</h3>
              <p>Please try refreshing the page.</p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
