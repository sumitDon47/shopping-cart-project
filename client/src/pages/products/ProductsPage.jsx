import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setProducts, setCategories, setError } from '../../redux/slices/productSlice';
import { productAPI, cartAPI } from '../../services/api';
import { setCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  FiSearch, FiFilter, FiGrid, FiList, FiShoppingCart,
  FiStar, FiChevronLeft, FiChevronRight, FiX, FiPackage,
} from 'react-icons/fi';
import './ProductsPage.css';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, loading, page, pages, total } = useSelector((s) => s.products);
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [search, setSearch]     = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy]     = useState('-createdAt');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);

  const currentPage = Number(searchParams.get('page')) || 1;

  // Fetch categories on mount
  useEffect(() => {
    productAPI.getCategories().then((res) => dispatch(setCategories(res.data))).catch(() => {});
  }, [dispatch]);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      dispatch(setLoading());
      try {
        const params = { page: currentPage, limit: 12, sort: sortBy };
        if (search.trim()) params.search = search.trim();
        if (category && category !== 'all') params.category = category;
        const res = await productAPI.getAll(params);
        dispatch(setProducts(res.data));
      } catch (err) {
        dispatch(setError(err.response?.data?.message || 'Failed to load products'));
      }
    };
    fetchProducts();
  }, [dispatch, currentPage, category, sortBy, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams((p) => { p.set('page', '1'); if (search) p.set('search', search); else p.delete('search'); return p; });
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setSearchParams((p) => { p.set('page', '1'); if (cat !== 'all') p.set('category', cat); else p.delete('category'); return p; });
  };

  const handlePageChange = (newPage) => {
    setSearchParams((p) => { p.set('page', String(newPage)); return p; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return; }
    if (user?.role === 'admin') { toast.error('Admin accounts cannot purchase products'); return; }
    setAddingToCart(productId);
    try {
      const res = await cartAPI.add({ productId, quantity: 1 });
      dispatch(setCart(res.data));
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="products-page">
      <Navbar />

      <main className="products-main">
        <div className="products-inner">

          {/* Header */}
          <div className="products-header">
            <div>
              <h1 className="products-title">Products</h1>
              <p className="products-count">{total} products found</p>
            </div>

            <div className="products-controls">
              {/* Search */}
              <form onSubmit={handleSearch} className="products-search">
                <FiSearch className="products-search-icon" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="products-search-input"
                />
                {search && (
                  <button type="button" className="products-search-clear" onClick={() => { setSearch(''); setSearchParams((p) => { p.delete('search'); p.set('page', '1'); return p; }); }}>
                    <FiX />
                  </button>
                )}
              </form>

              {/* Sort */}
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="products-sort">
                <option value="-createdAt">Newest</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Top Rated</option>
                <option value="name">Name: A-Z</option>
              </select>

              {/* View Toggle */}
              <div className="products-view-toggle">
                <button className={`pvt-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><FiGrid /></button>
                <button className={`pvt-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><FiList /></button>
              </div>

              <button className="products-filter-btn" onClick={() => setShowFilters(!showFilters)}>
                <FiFilter /> Filters
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="products-filters fade-in-up">
              <div className="products-filter-group">
                <h4>Category</h4>
                <div className="products-filter-chips">
                  <button className={`filter-chip ${category === 'all' ? 'active' : ''}`} onClick={() => handleCategoryChange('all')}>All</button>
                  {categories.map((cat) => (
                    <button key={cat} className={`filter-chip ${category === cat ? 'active' : ''}`} onClick={() => handleCategoryChange(cat)}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Category Chips (always visible) */}
          <div className="products-category-bar">
            <button className={`cat-chip ${category === 'all' ? 'active' : ''}`} onClick={() => handleCategoryChange('all')}>All</button>
            {categories.map((cat) => (
              <button key={cat} className={`cat-chip ${category === cat ? 'active' : ''}`} onClick={() => handleCategoryChange(cat)}>{cat}</button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="products-loading">
              {[...Array(8)].map((_, i) => <div key={i} className="product-skeleton" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="products-empty">
              <FiPackage className="products-empty-icon" />
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={`products-grid ${viewMode}`}>
              {products.map((product) => (
                <div key={product._id} className="product-card">
                  <Link to={`/products/${product._id}`} className="product-card-image">
                    <img src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'} alt={product.name} loading="lazy" />
                    {product.stock < 5 && product.stock > 0 && (
                      <span className="product-badge low-stock">Only {product.stock} left</span>
                    )}
                    {product.stock === 0 && (
                      <span className="product-badge out-of-stock">Out of Stock</span>
                    )}
                  </Link>
                  <div className="product-card-body">
                    <span className="product-card-category">{product.category}</span>
                    <Link to={`/products/${product._id}`} className="product-card-name">{product.name}</Link>
                    <div className="product-card-rating">
                      <FiStar className="star-icon" />
                      <span>{product.rating?.toFixed(1) || '0.0'}</span>
                      <span className="rating-count">({product.numReviews || 0})</span>
                    </div>
                    <div className="product-card-footer">
                      <span className="product-card-price">${product.price.toFixed(2)}</span>
                      {user?.role !== 'admin' && (
                        <button
                          className="product-add-btn"
                          onClick={() => handleAddToCart(product._id)}
                          disabled={product.stock === 0 || addingToCart === product._id}
                        >
                          {addingToCart === product._id ? (
                            <span className="btn-spinner" />
                          ) : (
                            <><FiShoppingCart /> Add</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="products-pagination">
              <button className="page-btn" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                <FiChevronLeft /> Prev
              </button>
              <div className="page-numbers">
                {[...Array(pages)].map((_, i) => (
                  <button key={i + 1} className={`page-num ${page === i + 1 ? 'active' : ''}`} onClick={() => handlePageChange(i + 1)}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button className="page-btn" disabled={page >= pages} onClick={() => handlePageChange(page + 1)}>
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;
