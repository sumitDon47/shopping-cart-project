import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, orderAPI } from '../../services/api';
import Footer from '../../components/common/Footer';
import AdminHeader from './AdminHeader';
import {
  FiPackage, FiSearch, FiX, FiDollarSign, FiTruck, FiCheckCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await adminAPI.getAllOrders();
      setOrders(data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const paidCount = orders.filter((o) => o.isPaid).length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      o._id.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page">
      <main className="admin-main">
        <div className="admin-inner">

          <AdminHeader
            title="Customer"
            gradient="Orders"
            subtitle={`${orders.length} total orders · $${totalRevenue.toFixed(2)} revenue`}
          />

          {/* ── Summary Cards ──────────────────────────── */}
          <div className="admin-stats">
            <div className="admin-stat-card" style={{ '--stat-color': '#3b82f6' }}>
              <div className="admin-stat-icon"><FiPackage /></div>
              <div>
                <div className="admin-stat-value">{orders.length}</div>
                <div className="admin-stat-label">Total Orders</div>
              </div>
            </div>
            <div className="admin-stat-card" style={{ '--stat-color': '#10b981' }}>
              <div className="admin-stat-icon"><FiDollarSign /></div>
              <div>
                <div className="admin-stat-value">${totalRevenue.toFixed(2)}</div>
                <div className="admin-stat-label">Total Revenue</div>
              </div>
            </div>
            <div className="admin-stat-card" style={{ '--stat-color': '#a855f7' }}>
              <div className="admin-stat-icon"><FiCheckCircle /></div>
              <div>
                <div className="admin-stat-value">{paidCount}</div>
                <div className="admin-stat-label">Paid Orders</div>
              </div>
            </div>
            <div className="admin-stat-card" style={{ '--stat-color': '#f59e0b' }}>
              <div className="admin-stat-icon"><FiTruck /></div>
              <div>
                <div className="admin-stat-value">{deliveredCount}</div>
                <div className="admin-stat-label">Delivered</div>
              </div>
            </div>
          </div>

          {/* ── Search + Filter ────────────────────────── */}
          <div className="admin-toolbar">
            <div className="admin-search">
              <FiSearch style={{ color: '#71717a', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by order ID or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <FiX
                  style={{ color: '#71717a', cursor: 'pointer', flexShrink: 0 }}
                  onClick={() => setSearch('')}
                />
              )}
            </div>
            <select
              className="admin-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* ── Orders Table ───────────────────────────── */}
          {loading ? (
            <div className="admin-loader"><div className="admin-spinner" /></div>
          ) : (
            <div className="admin-card">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <tr key={order._id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                          <Link
                            to={`/orders/${order._id}`}
                            style={{ color: 'var(--accent-text)', textDecoration: 'none' }}
                          >
                            #{order._id.slice(-8).toUpperCase()}
                          </Link>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                            {order.user?.name || 'Unknown'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {order.user?.email || ''}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-tertiary)' }}>
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </td>
                        <td style={{ fontWeight: 700, color: '#10b981' }}>
                          ${order.totalPrice.toFixed(2)}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            fontSize: '0.8125rem',
                            color: order.isPaid ? '#10b981' : 'var(--text-muted)',
                          }}>
                            {order.isPaid ? '✓ Paid' : '✗ Unpaid'}
                          </span>
                        </td>
                        <td>
                          <select
                            className={`admin-status-select ${order.status}`}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            disabled={updatingId === order._id}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>
                          {search || statusFilter !== 'all' ? 'No matching orders found' : 'No orders yet'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminOrders;
