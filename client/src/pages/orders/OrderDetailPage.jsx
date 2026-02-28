import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setOrder, setOrderLoading, setOrderError, clearOrder } from '../../redux/slices/orderSlice';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { PageLoader } from '../../components/common/Loader';
import {
  FiArrowLeft, FiPackage, FiMapPin, FiCreditCard,
  FiTruck, FiCheckCircle, FiClock, FiXCircle,
} from 'react-icons/fi';
import './OrderDetailPage.css';

const STATUS_CONFIG = {
  pending: { icon: <FiClock />, color: '#fbbf24', label: 'Pending' },
  processing: { icon: <FiPackage />, color: '#60a5fa', label: 'Processing' },
  shipped: { icon: <FiTruck />, color: '#a855f7', label: 'Shipped' },
  delivered: { icon: <FiCheckCircle />, color: '#34d399', label: 'Delivered' },
  cancelled: { icon: <FiXCircle />, color: '#f87171', label: 'Cancelled' },
};

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((s) => s.orders);

  useEffect(() => {
    const fetch = async () => {
      dispatch(setOrderLoading());
      try {
        const res = await orderAPI.getById(id);
        dispatch(setOrder(res.data));
      } catch {
        dispatch(setOrderError('Order not found'));
        toast.error('Order not found');
      }
    };
    fetch();
    return () => dispatch(clearOrder());
  }, [id, dispatch]);

  if (loading || !order) return <><Navbar /><PageLoader text="Loading order..." /></>;

  const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="od-page">
      <Navbar />
      <main className="od-main">
        <div className="od-inner">
          <Link to="/orders" className="od-back"><FiArrowLeft /> Back to Orders</Link>

          <div className="od-header">
            <div>
              <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
              <span className="od-date">{new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <span className="od-status-badge" style={{ background: `${st.color}18`, color: st.color }}>
              {st.icon} {st.label}
            </span>
          </div>

          {/* Progress Tracker */}
          {order.status !== 'cancelled' && (
            <div className="od-progress">
              {STEPS.map((step, i) => (
                <div key={step} className={`od-step ${i <= currentStep ? 'active' : ''} ${i === currentStep ? 'current' : ''}`}>
                  <div className="od-step-dot" />
                  <span className="od-step-label">{STATUS_CONFIG[step].label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="od-grid">
            {/* Items */}
            <div className="od-card od-items-card">
              <h2><FiPackage /> Items ({order.items.length})</h2>
              <div className="od-items-list">
                {order.items.map((item, i) => (
                  <div key={i} className="od-item">
                    <img src={item.image || 'https://via.placeholder.com/56'} alt={item.name} />
                    <div className="od-item-info">
                      <span className="od-item-name">{item.name}</span>
                      <span className="od-item-qty">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                    </div>
                    <span className="od-item-total">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="od-side">
              {/* Shipping */}
              <div className="od-card">
                <h2><FiMapPin /> Shipping Address</h2>
                {order.shippingAddress && (
                  <p className="od-address">
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                    {order.shippingAddress.country}
                  </p>
                )}
              </div>

              {/* Payment */}
              <div className="od-card">
                <h2><FiCreditCard /> Payment</h2>
                <p className="od-payment-method">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'card' ? 'Credit / Debit Card' : 'UPI'}
                </p>
                <span className={`od-paid-badge ${order.isPaid ? 'paid' : 'unpaid'}`}>
                  {order.isPaid ? 'Paid' : 'Not Paid'}
                </span>
              </div>

              {/* Summary */}
              <div className="od-card">
                <h2>Price Summary</h2>
                <div className="od-sum-row"><span>Subtotal</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
                <div className="od-sum-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice?.toFixed(2)}`}</span></div>
                <div className="od-sum-row"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
                <div className="od-divider" />
                <div className="od-sum-row total"><span>Total</span><span>${order.totalPrice?.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetailPage;
