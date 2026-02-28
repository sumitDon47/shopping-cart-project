import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowRight } from 'react-icons/fi';
import './KhaltiCallback.css';

const KhaltiCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed
  const [message, setMessage] = useState('Verifying your payment...');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const pidx = searchParams.get('pidx');
      const purchase_order_id = searchParams.get('purchase_order_id');
      const khaltiStatus = searchParams.get('status');

      if (!pidx || !purchase_order_id) {
        setStatus('failed');
        setMessage('Invalid payment callback. Missing required parameters.');
        return;
      }

      setOrderId(purchase_order_id);

      // If Khalti returned a non-completed status
      if (khaltiStatus && khaltiStatus !== 'Completed') {
        setStatus('failed');
        setMessage(`Payment was ${khaltiStatus.toLowerCase()}. Please try again.`);
        return;
      }

      try {
        const res = await paymentAPI.khaltiVerify({
          pidx,
          orderId: purchase_order_id,
        });

        if (res.data.success) {
          setStatus('success');
          setMessage('Payment successful! Your order has been confirmed.');
          toast.success('Payment verified successfully! 🎉');
        } else {
          setStatus('failed');
          setMessage(res.data.message || 'Payment verification failed.');
        }
      } catch (err) {
        setStatus('failed');
        setMessage(err.response?.data?.message || 'Failed to verify payment. Please contact support.');
        toast.error('Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="khalti-cb-page">
      <Navbar />
      <main className="khalti-cb-main">
        <div className="khalti-cb-card">
          {status === 'verifying' && (
            <>
              <div className="khalti-cb-icon verifying">
                <FiLoader className="spinning" />
              </div>
              <h2>Verifying Payment</h2>
              <p>{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="khalti-cb-icon success">
                <FiCheckCircle />
              </div>
              <h2>Payment Successful!</h2>
              <p>{message}</p>
              <Link to={`/orders/${orderId}`} className="khalti-cb-btn">
                View Order <FiArrowRight />
              </Link>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="khalti-cb-icon failed">
                <FiXCircle />
              </div>
              <h2>Payment Failed</h2>
              <p>{message}</p>
              <div className="khalti-cb-actions">
                {orderId && (
                  <Link to={`/orders/${orderId}`} className="khalti-cb-btn secondary">
                    View Order
                  </Link>
                )}
                <Link to="/orders" className="khalti-cb-btn">
                  My Orders <FiArrowRight />
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KhaltiCallback;
