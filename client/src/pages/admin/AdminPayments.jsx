import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Footer from '../../components/common/Footer';
import AdminHeader from './AdminHeader';
import {
  FiCreditCard, FiSearch, FiX, FiDollarSign,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const PAYMENT_LABELS = {
  cod: 'Cash on Delivery',
  card: 'Credit / Debit Card',
  upi: 'UPI',
  khalti: 'Khalti',
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const { data } = await adminAPI.getPaidOrders();
      setPayments(data);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = payments.reduce((sum, o) => sum + o.totalPrice, 0);

  const filtered = payments.filter((o) => {
    const q = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      (PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod).toLowerCase().includes(q) ||
      o.paymentResult?.transactionId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-page">
      <main className="admin-main">
        <div className="admin-inner">

          <AdminHeader
            title="Payment"
            gradient="History"
            subtitle={`${payments.length} paid orders \u00B7 $${totalCollected.toFixed(2)} collected`}
          />

          {/* ── Summary Cards ──────────────────────────── */}
          <div className="admin-stats">
            <div className="admin-stat-card" style={{ '--stat-color': '#10b981' }}>
              <div className="admin-stat-icon"><FiDollarSign /></div>
              <div>
                <div className="admin-stat-value">${totalCollected.toFixed(2)}</div>
                <div className="admin-stat-label">Total Collected</div>
              </div>
            </div>
            <div className="admin-stat-card" style={{ '--stat-color': '#3b82f6' }}>
              <div className="admin-stat-icon"><FiCreditCard /></div>
              <div>
                <div className="admin-stat-value">{payments.length}</div>
                <div className="admin-stat-label">Paid Orders</div>
              </div>
            </div>
            <div className="admin-stat-card" style={{ '--stat-color': '#a855f7' }}>
              <div className="admin-stat-icon"><FiCreditCard /></div>
              <div>
                <div className="admin-stat-value">
                  {payments.filter((o) => o.paymentMethod === 'khalti').length}
                </div>
                <div className="admin-stat-label">Khalti Payments</div>
              </div>
            </div>
            <div className="admin-stat-card" style={{ '--stat-color': '#f59e0b' }}>
              <div className="admin-stat-icon"><FiDollarSign /></div>
              <div>
                <div className="admin-stat-value">
                  {payments.filter((o) => o.paymentMethod === 'cod').length}
                </div>
                <div className="admin-stat-label">COD Payments</div>
              </div>
            </div>
          </div>

          {/* ── Search ─────────────────────────────────── */}
          <div className="admin-toolbar">
            <div className="admin-search">
              <FiSearch style={{ color: '#71717a', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by order ID, customer, method, or transaction ID..."
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
          </div>

          {/* ── Payments Table ─────────────────────────── */}
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
                      <th>Method</th>
                      <th>Transaction ID</th>
                      <th>Amount</th>
                      <th>Paid At</th>
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
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {order.user?.name || 'Unknown'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {order.user?.email || ''}
                          </div>
                        </td>
                        <td>
                          <span className={`admin-payment-badge ${order.paymentMethod}`}>
                            {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                          {order.paymentResult?.transactionId || order.paymentResult?.pidx || '—'}
                        </td>
                        <td style={{ fontWeight: 700, color: '#10b981' }}>
                          ${order.totalPrice.toFixed(2)}
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {order.paidAt
                            ? new Date(order.paidAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>
                          {search ? 'No matching payments found' : 'No paid orders yet'}
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

export default AdminPayments;
