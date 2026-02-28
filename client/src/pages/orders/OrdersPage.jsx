import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setOrders, setOrderLoading, setOrderError } from '../../redux/slices/orderSlice';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { PageLoader } from '../../components/common/Loader';
import { FiPackage, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import './OrdersPage.css';

const STATUS_COLORS = {
  pending: '#fbbf24',
  processing: '#60a5fa',
  shipped: '#a855f7',
  delivered: '#34d399',
  cancelled: '#f87171',
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);

  useEffect(() => {
    const fetch = async () => {
      dispatch(setOrderLoading());
      try {
        const res = await orderAPI.myOrders();
        dispatch(setOrders(res.data));
      } catch (err) {
        dispatch(setOrderError('Failed to load orders'));
        toast.error('Failed to load orders');
      }
    };
    fetch();
  }, [dispatch]);

  if (loading) return <><Navbar /><PageLoader text="Loading orders..." /></>;

  return (
    <div className="orders-page">
      <Navbar />
      <main className="orders-main">
        <div className="orders-inner">
          <h1 className="orders-title"><FiPackage /> My Orders</h1>

          {(!orders || orders.length === 0) ? (
            <div className="orders-empty">
              <FiShoppingBag className="orders-empty-icon" />
              <h2>No orders yet</h2>
              <p>Start shopping and your orders will appear here.</p>
              <Link to="/products" className="orders-browse-btn">Browse Products</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <Link to={`/orders/${order._id}`} key={order._id} className="order-card">
                  <div className="order-card-top">
                    <div>
                      <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <span className="order-status" style={{ background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status] }}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-card-items">
                    {order.items.slice(0, 3).map((item, i) => (
                      <img key={i} src={item.image || 'https://via.placeholder.com/40'} alt={item.name} className="order-thumb" />
                    ))}
                    {order.items.length > 3 && <span className="order-more">+{order.items.length - 3}</span>}
                  </div>
                  <div className="order-card-bottom">
                    <span className="order-total">${order.totalPrice?.toFixed(2)}</span>
                    <span className="order-items-count">{order.items.reduce((a, i) => a + i.quantity, 0)} items</span>
                    <FiArrowRight className="order-arrow" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage;
