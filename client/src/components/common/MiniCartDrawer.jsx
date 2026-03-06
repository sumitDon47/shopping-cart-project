import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../../redux/slices/cartSlice';
import { cartAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiX, FiShoppingBag, FiMinus, FiPlus, FiTrash2,
  FiArrowRight, FiShoppingCart,
} from 'react-icons/fi';
import './MiniCartDrawer.css';

const MiniCartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalPrice, totalItems } = useSelector((s) => s.cart);
  const [updating, setUpdating] = useState(null);
  const [removing, setRemoving] = useState(null);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleBackdrop = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

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
    setRemoving(itemId);
    try {
      const res = await cartAPI.remove(itemId);
      dispatch(setCart(res.data));
    } catch (err) {
      toast.error('Failed to remove item');
    } finally {
      setRemoving(null);
    }
  };

  const handleViewCart = () => { onClose(); navigate('/cart'); };
  const handleCheckout = () => { onClose(); navigate('/checkout'); };

  const shipping = totalPrice >= 50 ? 0 : 4.99;
  const freeShipProgress = Math.min((totalPrice / 50) * 100, 100);

  if (!isOpen) return null;

  return createPortal(
    <div className="mini-cart-backdrop" onClick={handleBackdrop}>
      <div className="mini-cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">

        {/* Header */}
        <div className="mini-cart-header">
          <div className="mini-cart-title">
            <FiShoppingBag className="mini-cart-icon" />
            <h3>Your Cart</h3>
            {totalItems > 0 && <span className="mini-cart-badge">{totalItems}</span>}
          </div>
          <button className="mini-cart-close" onClick={onClose} aria-label="Close cart">
            <FiX />
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div className="mini-cart-shipping">
            {totalPrice >= 50 ? (
              <p className="mini-cart-ship-text ship-free">🎉 You've unlocked <strong>free shipping!</strong></p>
            ) : (
              <p className="mini-cart-ship-text">
                Add <strong>${(50 - totalPrice).toFixed(2)}</strong> more for free shipping
              </p>
            )}
            <div className="mini-cart-ship-bar">
              <div className="mini-cart-ship-fill" style={{ width: `${freeShipProgress}%` }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="mini-cart-items">
          {items.length === 0 ? (
            <div className="mini-cart-empty">
              <FiShoppingCart className="mini-cart-empty-icon" />
              <p>Your cart is empty</p>
              <button className="mini-cart-browse-btn" onClick={() => { onClose(); navigate('/products'); }}>
                Browse Products
              </button>
            </div>
          ) : (
            items.map((item, index) => {
              const prod = item.product;
              return (
                <div
                  key={item._id}
                  className={`mini-cart-item ${removing === item._id ? 'removing' : ''} ${updating === item._id ? 'updating' : ''}`}
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <Link to={`/products/${prod._id}`} className="mini-cart-item-img" onClick={onClose}>
                    <img src={prod.image || 'https://via.placeholder.com/80'} alt={prod.name} />
                  </Link>

                  <div className="mini-cart-item-body">
                    <div className="mini-cart-item-top">
                      <Link to={`/products/${prod._id}`} className="mini-cart-item-name" onClick={onClose}>
                        {prod.name}
                      </Link>
                      <button
                        className="mini-cart-item-remove"
                        onClick={() => handleRemove(item._id)}
                        aria-label="Remove item"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    {prod.brand && <span className="mini-cart-item-brand">{prod.brand}</span>}
                    <div className="mini-cart-item-bottom">
                      <div className="mini-cart-qty">
                        <button
                          onClick={() => handleUpdateQty(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updating === item._id}
                        >
                          <FiMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item._id, item.quantity + 1)}
                          disabled={updating === item._id}
                        >
                          <FiPlus />
                        </button>
                      </div>
                      <span className="mini-cart-item-price">${(prod.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="mini-cart-footer">
            <div className="mini-cart-totals">
              <div className="mini-cart-row">
                <span>Subtotal</span>
                <span className="mini-cart-total-val">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="mini-cart-row sub">
                <span>Shipping</span>
                <span>{shipping === 0 ? <em className="ship-free-label">Free</em> : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>
            <button className="mini-cart-checkout-btn" onClick={handleCheckout}>
              Checkout <FiArrowRight />
            </button>
            <button className="mini-cart-view-btn" onClick={handleViewCart}>
              View Full Cart
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default MiniCartDrawer;
