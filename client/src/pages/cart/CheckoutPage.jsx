import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearCart } from '../../redux/slices/cartSlice';
import { orderAPI, paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  FiArrowLeft, FiMapPin, FiCreditCard, FiCheck,
  FiTruck, FiPackage,
} from 'react-icons/fi';
import useScrollReveal from '../../utils/useScrollReveal';
import './CheckoutPage.css';

const CheckoutPage = () => {
  useScrollReveal();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, totalItems } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const [placing, setPlacing] = useState(false);

  // Admin cannot checkout — redirect to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [form, setForm] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
    paymentMethod: 'cod',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const shipping = totalPrice >= 50 ? 0 : 4.99;
  const tax = totalPrice * 0.08;
  const orderTotal = totalPrice + shipping + tax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!form.street || !form.city || !form.state || !form.zipCode || !form.country) {
      return toast.error('Please fill all address fields');
    }
    setPlacing(true);
    try {
      const res = await orderAPI.create({
        shippingAddress: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode, country: form.country },
        paymentMethod: form.paymentMethod,
      });
      dispatch(clearCart());

      // For Khalti payment, initiate payment and redirect
      if (form.paymentMethod === 'khalti') {
        try {
          const payRes = await paymentAPI.khaltiInitiate({ orderId: res.data._id });
          toast.success('Redirecting to Khalti...');
          window.location.href = payRes.data.payment_url;
          return;
        } catch (payErr) {
          toast.error('Failed to initiate Khalti payment. You can pay later from order details.');
          navigate(`/orders/${res.data._id}`);
          return;
        }
      }

      toast.success('Order placed successfully!');
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar />
        <main className="checkout-main">
          <div className="checkout-inner checkout-empty">
            <FiPackage className="checkout-empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Add items to your cart before checking out.</p>
            <Link to="/products" className="co-browse-btn">Browse Products</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />
      <main className="checkout-main">
        <div className="checkout-inner">
          <Link to="/cart" className="co-back"><FiArrowLeft /> Back to Cart</Link>
          <h1 className="co-title">Checkout</h1>

          <form className="co-layout" onSubmit={handlePlaceOrder}>
            {/* Left — Address + Payment */}
            <div className="co-form-section">
              <div className="co-card">
                <h2><FiMapPin /> Shipping Address</h2>
                <div className="co-field">
                  <label>Street Address</label>
                  <input name="street" value={form.street} onChange={handleChange} placeholder="123 Main Street" required />
                </div>
                <div className="co-row">
                  <div className="co-field"><label>City</label><input name="city" value={form.city} onChange={handleChange} placeholder="City" required /></div>
                  <div className="co-field"><label>State</label><input name="state" value={form.state} onChange={handleChange} placeholder="State" required /></div>
                </div>
                <div className="co-row">
                  <div className="co-field"><label>ZIP Code</label><input name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="10001" required /></div>
                  <div className="co-field"><label>Country</label><input name="country" value={form.country} onChange={handleChange} placeholder="Country" required /></div>
                </div>
              </div>

              <div className="co-card">
                <h2><FiCreditCard /> Payment Method</h2>
                {[
                  { value: 'cod', label: 'Cash on Delivery' },
                  { value: 'khalti', label: 'Khalti (Online Payment)' },
                  { value: 'card', label: 'Credit / Debit Card' },
                  { value: 'upi', label: 'UPI' },
                ].map((pm) => (
                  <label key={pm.value} className={`co-payment-opt ${form.paymentMethod === pm.value ? 'active' : ''}`}>
                    <input type="radio" name="paymentMethod" value={pm.value} checked={form.paymentMethod === pm.value} onChange={handleChange} />
                    <span className="co-radio-circle">{form.paymentMethod === pm.value && <FiCheck />}</span>
                    <span className="co-pm-text">{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Right — Summary */}
            <div className="co-summary">
              <h2>Order Summary</h2>
              <div className="co-items-list">
                {items.map((item) => (
                  <div key={item._id} className="co-item">
                    <img src={item.product.image || 'https://via.placeholder.com/56'} alt={item.product.name} />
                    <div className="co-item-info">
                      <span className="co-item-name">{item.product.name}</span>
                      <span className="co-item-qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="co-item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="co-divider" />
              <div className="co-sum-row"><span>Subtotal ({totalItems})</span><span>${totalPrice.toFixed(2)}</span></div>
              <div className="co-sum-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="co-sum-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="co-divider" />
              <div className="co-sum-row total"><span>Total</span><span>${orderTotal.toFixed(2)}</span></div>

              <button className="co-place-btn" type="submit" disabled={placing}>
                {placing ? <span className="btn-spinner" /> : <><FiTruck /> {form.paymentMethod === 'khalti' ? 'Pay with Khalti' : 'Place Order'}</>}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
