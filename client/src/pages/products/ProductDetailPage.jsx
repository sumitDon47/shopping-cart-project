import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setProduct, setLoading, setError, clearProduct } from '../../redux/slices/productSlice';
import { setCart } from '../../redux/slices/cartSlice';
import { productAPI, cartAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { PageLoader } from '../../components/common/Loader';
import {
  FiArrowLeft, FiShoppingCart, FiStar, FiPackage,
  FiTruck, FiShield, FiRefreshCw, FiMinus, FiPlus, FiCheck,
} from 'react-icons/fi';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((s) => s.products);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      dispatch(setLoading());
      try {
        const res = await productAPI.getById(id);
        dispatch(setProduct(res.data));
      } catch (err) {
        dispatch(setError('Product not found'));
        toast.error('Product not found');
      }
    };
    fetchProduct();
    return () => dispatch(clearProduct());
  }, [id, dispatch]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); navigate('/login'); return; }
    setAddingToCart(true);
    try {
      const res = await cartAPI.add({ productId: product._id, quantity });
      dispatch(setCart(res.data));
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading || !product) return <><Navbar /><PageLoader text="Loading product..." /></>;

  return (
    <div className="pd-page">
      <Navbar />
      <main className="pd-main">
        <div className="pd-inner">
          {/* Breadcrumb */}
          <div className="pd-breadcrumb">
            <Link to="/products" className="pd-back"><FiArrowLeft /> Back to Products</Link>
            <span className="pd-crumb">{product.category}</span>
          </div>

          <div className="pd-content">
            {/* Image */}
            <div className="pd-image-section">
              <div className="pd-image-container">
                <img src={product.image || 'https://via.placeholder.com/600x400?text=No+Image'} alt={product.name} />
              </div>
            </div>

            {/* Info */}
            <div className="pd-info-section">
              <span className="pd-category">{product.category}</span>
              {product.brand && <span className="pd-brand">by {product.brand}</span>}
              <h1 className="pd-name">{product.name}</h1>

              <div className="pd-rating-row">
                <div className="pd-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar key={star} className={`pd-star ${star <= Math.round(product.rating) ? 'filled' : ''}`} />
                  ))}
                </div>
                <span className="pd-rating-text">{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
              </div>

              <p className="pd-price">${product.price.toFixed(2)}</p>

              {product.description && (
                <p className="pd-description">{product.description}</p>
              )}

              {/* Stock */}
              <div className={`pd-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.stock > 0 ? (
                  <><FiCheck /> In Stock ({product.stock} available)</>
                ) : (
                  <><FiPackage /> Out of Stock</>
                )}
              </div>

              {/* Quantity + Add to Cart */}
              {product.stock > 0 && (
                <div className="pd-actions">
                  <div className="pd-quantity">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="pd-qty-btn"><FiMinus /></button>
                    <span className="pd-qty-value">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="pd-qty-btn"><FiPlus /></button>
                  </div>
                  <button className="pd-add-to-cart" onClick={handleAddToCart} disabled={addingToCart}>
                    {addingToCart ? <span className="btn-spinner" /> : <><FiShoppingCart /> Add to Cart</>}
                  </button>
                </div>
              )}

              {/* Features */}
              <div className="pd-features">
                {[
                  { icon: <FiTruck />, text: 'Free shipping over $50' },
                  { icon: <FiShield />, text: 'Secure checkout' },
                  { icon: <FiRefreshCw />, text: '30-day returns' },
                ].map(({ icon, text }) => (
                  <div key={text} className="pd-feature">
                    {icon}<span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="pd-reviews-section">
              <h2 className="pd-reviews-title">Customer Reviews ({product.reviews.length})</h2>
              <div className="pd-reviews-grid">
                {product.reviews.map((review, i) => (
                  <div key={i} className="pd-review-card">
                    <div className="pd-review-header">
                      <div className="pd-review-avatar">{review.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <p className="pd-review-name">{review.name}</p>
                        <div className="pd-review-stars">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar key={s} className={`pd-star small ${s <= review.rating ? 'filled' : ''}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="pd-review-comment">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
