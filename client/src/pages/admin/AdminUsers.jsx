import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import Footer from '../../components/common/Footer';
import AdminHeader from './AdminHeader';
import {
  FiTrash2, FiSearch, FiX, FiMail, FiShoppingCart, FiCalendar,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <main className="admin-main">
        <div className="admin-inner">

          <AdminHeader
            title="User"
            gradient="Activity"
            subtitle={`${users.length} registered users`}
          />

          {/* ── Search ─────────────────────────────────── */}
          <div className="admin-toolbar">
            <div className="admin-search">
              <FiSearch style={{ color: '#71717a', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search users by name or email..."
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

          {/* ── Users Table ────────────────────────────── */}
          {loading ? (
            <div className="admin-loader"><div className="admin-spinner" /></div>
          ) : (
            <div className="admin-card">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Orders</th>
                      <th>Total Spent</th>
                      <th>Last Order</th>
                      <th>Joined</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: 40, height: 40, borderRadius: '50%',
                              background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                            }}>
                              {u.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                              <div style={{ color: '#71717a', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FiMail size={11} /> {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td><span className={`admin-role-badge ${u.role}`}>{u.role}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d4d4d8' }}>
                            <FiShoppingCart size={13} /> {u.orderCount}
                          </div>
                        </td>
                        <td style={{ color: '#34d399', fontWeight: 600 }}>
                          ${u.totalSpent?.toFixed(2) || '0.00'}
                        </td>
                        <td style={{ color: '#a1a1aa', fontSize: '0.8125rem' }}>
                          {u.lastOrder
                            ? new Date(u.lastOrder).toLocaleDateString()
                            : '—'}
                        </td>
                        <td style={{ color: '#a1a1aa', fontSize: '0.8125rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiCalendar size={12} />
                            {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          {u.role !== 'admin' && (
                            <button className="admin-delete-btn" onClick={() => handleDelete(u._id, u.name)}>
                              <FiTrash2 /> Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>No users found</td></tr>
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

export default AdminUsers;
