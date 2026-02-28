import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCart, clearCart } from '../../redux/slices/cartSlice';
import { cartAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { PageLoader } from '../../components/common/Loader';
import {
  FiTrash2, FiMinus, FiPlus, FiShoppingBag,
  FiArrowRight, FiShoppingCart, FiPackage,
} from 'react-icons/fi';
import './CartPage.css';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, totalItems, loading } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const [updating, setUpdating] = useState(null);

  // Admin cannot access cart — redirect to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await cartAPI.get();
        dispatch(setCart(res.data));
      } catch (err) {
        toast.error('Failed to load cart');
      }
    };
    fetchCart();
  }, [dispatch]);

  const handleUpdateQty = async (itemId, quantity) => {
    if (quantity < 1) return;
    setUpdating(itemId);
    try {
      const res = await cartAPI.update(itemId, { quantity });
      dispatch(setCart(res.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId) => {
    setUpdating(itemId);
    try {
      const res = await cartAPI.remove(itemId);
      dispatch(setCart(res.data));
      toast.success('Item removed');
    } catch (err) {
      toast.error('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const handleClear = async () => {
    try {
      await cartAPI.clear();
      dispatch(clearCart());
      toast.success('Cart cleared');
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  if (loading) return <><Navbar /><PageLoader text="Loading cart..." /></>;

  const shipping = totalPrice >= 50 ? 0 : 4.99;
  const tax = totalPrice * 0.08;
  const orderTotal = totalPrice + shipping + tax;

  return (
    <div className="cart-page">
      <Navbar />
      <main className="cart-main">
        <div className="cart-inner">
          <div className="cart-header">
            <h1><FiShoppingCart /> Shopping Cart</h1>
            {items.length > 0 && (
              <span className="cart-count">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="cart-empty">
              <FiShoppingBag className="cart-empty-icon" />
              <h2>Your cart is empty</h2>
              <p>Explore our products and add something you love.</p>
              <Link to="/products" className="cart-browse-btn"><FiPackage /> Browse Products</Link>
            </div>
          ) : (
            <div className="cart-layout">
              {/* Items */}
              <div className="cart-items">
                {items.map((item) => {
                  const prod = item.product;
                  return (
                    <div key={item._id} className={`cart-item ${updating === item._id ? 'cart-item-updating' : ''}`}>
                      <Link to={`/products/${prod._id}`} className="cart-item-img">
                        <img src={prod.image || 'https://via.placeholder.com/120'} alt={prod.name} />
                      </Link>
                      <div className="cart-item-info">
                        <Link to={`/products/${prod._id}`} className="cart-item-name">{prod.name}</Link>
                        {prod.brand && <span className="cart-item-brand">{prod.brand}</span>}
                        <span className="cart-item-price">${prod.price.toFixed(2)}</span>
                      </div>
                      <div className="cart-item-controls">
                        <div className="cart-qty">
                          <button onClick={() => handleUpdateQty(item._id, item.quantity - 1)} className="cart-qty-btn"><FiMinus /></button>
                          <span className="cart-qty-val">{item.quantity}</span>
                          <button onClick={() => handleUpdateQty(item._id, item.quantity + 1)} className="cart-qty-btn"><FiPlus /></button>
                        </div>
                        <span className="cart-item-subtotal">${(prod.price * item.quantity).toFixed(2)}</span>
                        <button className="cart-remove-btn" onClick={() => handleRemove(item._id)}><FiTrash2 /></button>
                      </div>
                    </div>
                  );
                })}
                <button className="cart-clear-btn" onClick={handleClear}>Clear Cart</button>
              </div>

              {/* Summary */}
              <div className="cart-summary">
                <h2>Order Summary</h2>
                <div className="cart-summary-row"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
                <div className="cart-summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="cart-summary-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="cart-summary-divider" />
                <div className="cart-summary-row total"><span>Total</span><span>${orderTotal.toFixed(2)}</span></div>
                {shipping > 0 && (
                  <p className="cart-free-ship-note">Add ${(50 - totalPrice).toFixed(2)} more for free shipping!</p>
                )}
                <button className="cart-checkout-btn" onClick={() => navigate('/checkout')}>
                  Proceed to Checkout <FiArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
