import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './redux/store';
import { fetchCart } from './redux/slices/cartSlice';

// Route Guards
import ProtectedRoute, { PublicRoute } from './components/common/ProtectedRoute';

// Pages
import HomePage           from './pages/HomePage';
import AboutPage          from './pages/AboutPage';
import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ProfilePage        from './pages/user/ProfilePage';
import DashboardPage      from './pages/user/DashboardPage';
import ProductsPage       from './pages/products/ProductsPage';
import ProductDetailPage  from './pages/products/ProductDetailPage';
import CartPage            from './pages/cart/CartPage';
import CheckoutPage        from './pages/cart/CheckoutPage';
import OrdersPage          from './pages/orders/OrdersPage';
import OrderDetailPage     from './pages/orders/OrderDetailPage';
import AdminDashboard      from './pages/admin/AdminDashboard';
import AdminProducts       from './pages/admin/AdminProducts';
import AdminUsers          from './pages/admin/AdminUsers';
import AdminPayments       from './pages/admin/AdminPayments';
import AdminOrders         from './pages/admin/AdminOrders';
import KhaltiCallback      from './pages/payment/KhaltiCallback';
import NotFound            from './pages/NotFound';

import { ROUTES } from './utils/constants';
import './App.css';

/* Fetch the user's persisted cart when the app loads with an existing session */
const AppInit = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppInit>

        {/* ── Toast Notifications ───────────────────────── */}
        <Toaster
          position="top-right"
          containerStyle={{ zIndex: 99999 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 500,
              boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
              padding: '0.875rem 1.25rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: 'var(--bg-card)' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: 'var(--bg-card)' } },
          }}
        />

        <Routes>
          {/* ── Public pages ──────────────────────────────── */}
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />

          {/* ── Auth pages (redirect if logged in) ────────── */}
          <Route path={ROUTES.LOGIN}    element={<PublicRoute><LoginPage    /></PublicRoute>} />
          <Route path={ROUTES.REGISTER} element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* ── Products ──────────────────────────────────── */}
          <Route path={ROUTES.PRODUCTS}       element={<ProductsPage />} />
          <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />

          {/* ── Protected user pages ──────────────────────── */}
          <Route path={ROUTES.PROFILE}   element={<ProtectedRoute><ProfilePage   /></ProtectedRoute>} />
          <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path={ROUTES.CART}      element={<ProtectedRoute><CartPage      /></ProtectedRoute>} />
          <Route path={ROUTES.CHECKOUT}  element={<ProtectedRoute><CheckoutPage  /></ProtectedRoute>} />
          <Route path={ROUTES.ORDERS}    element={<ProtectedRoute><OrdersPage    /></ProtectedRoute>} />
          <Route path={ROUTES.ORDER_DETAIL} element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path={ROUTES.KHALTI_CALLBACK} element={<ProtectedRoute><KhaltiCallback /></ProtectedRoute>} />

          {/* ── Admin pages (role-guarded) ─────────────────── */}
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_PRODUCTS}
            element={
              <ProtectedRoute role="admin">
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_USERS}
            element={
              <ProtectedRoute role="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_PAYMENTS}
            element={
              <ProtectedRoute role="admin">
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_ORDERS}
            element={
              <ProtectedRoute role="admin">
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          {/* ── 404 ───────────────────────────────────────── */}
          <Route path="/404"  element={<NotFound />} />
          <Route path="*"     element={<Navigate to="/404" replace />} />
        </Routes>

        </AppInit>
      </Router>
    </Provider>
  );
}

export default App;
