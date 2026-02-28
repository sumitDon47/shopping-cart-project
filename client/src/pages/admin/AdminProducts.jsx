import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { ROUTES } from '../../utils/constants';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  FiUsers, FiBox, FiBarChart2, FiPlus,
  FiTrash2, FiSearch, FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const [form, setForm] = useState({
    name: '', description: '', mrp: '', price: '',
    image: '', category: '', brand: '', stock: '',
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.getAll({ limit: 200 });
      setProducts(data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Validation
    if (!form.name || !form.mrp || !form.price || !form.category) {
      toast.error('Please fill required fields');
      return;
    }
    if (Number(form.price) > Number(form.mrp)) {
      toast.error('Price cannot exceed MRP');
      return;
    }

    setSubmitting(true);
    try {
      await productAPI.create({
        ...form,
        mrp: Number(form.mrp),
        price: Number(form.price),
        stock: Number(form.stock) || 0,
      });
      toast.success('Product added!');
      setShowModal(false);
      setForm({ name: '', description: '', mrp: '', price: '', image: '', category: '', brand: '', stock: '' });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-main">
        <div className="admin-inner">

          {/* ── Header ─────────────────────────────────── */}
          <div className="admin-header">
            <div>
              <h1 className="admin-title">
                Manage <span className="admin-gradient">Products</span>
              </h1>
              <p className="admin-subtitle">{products.length} products in catalog</p>
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

          {/* ── Toolbar ────────────────────────────────── */}
          <div className="admin-toolbar">
            <div className="admin-search">
              <FiSearch style={{ color: '#71717a', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search products..."
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
            <button className="admin-add-btn" onClick={() => setShowModal(true)}>
              <FiPlus /> Add Product
            </button>
          </div>

          {/* ── Products Table ─────────────────────────── */}
          {loading ? (
            <div className="admin-loader"><div className="admin-spinner" /></div>
          ) : (
            <div className="admin-card">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>MRP</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Rating</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src={p.image} alt={p.name} className="admin-product-img" />
                            <div>
                              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                              <div style={{ color: '#71717a', fontSize: '0.75rem' }}>{p.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                        <td style={{ color: '#71717a', textDecoration: 'line-through' }}>${p.mrp?.toFixed(2) || '—'}</td>
                        <td style={{ color: '#34d399', fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                        <td>
                          <span style={{
                            color: p.stock < 5 ? '#f87171' : p.stock < 15 ? '#fbbf24' : '#34d399',
                            fontWeight: 600,
                          }}>
                            {p.stock}
                          </span>
                        </td>
                        <td>⭐ {p.rating?.toFixed(1) || '0.0'}</td>
                        <td>
                          <button className="admin-delete-btn" onClick={() => handleDelete(p._id, p.name)}>
                            <FiTrash2 /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>No products found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />

      {/* ── Add Product Modal ──────────────────────────── */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal-title">Add New Product</h2>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sony WH-1000XM5"
                />
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description..."
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>MRP ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.mrp}
                    onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                    placeholder="399.99"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="349.99"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    <option value="electronics">Electronics</option>
                    <option value="audio">Audio</option>
                    <option value="wearables">Wearables</option>
                    <option value="cameras">Cameras</option>
                    <option value="gaming">Gaming</option>
                    <option value="smart home">Smart Home</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="e.g. Sony"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="admin-form-submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Product'}
                </button>
                <button
                  type="button"
                  className="admin-delete-btn"
                  style={{ flex: 'none', padding: '0.875rem 1.5rem' }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
