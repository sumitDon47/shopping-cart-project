import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './redux/store';

// Route Guards
import ProtectedRoute, { PublicRoute } from './components/common/ProtectedRoute';

// Pages
import HomePage        from './pages/HomePage';
import LoginPage       from './pages/auth/LoginPage';
import RegisterPage    from './pages/auth/RegisterPage';
import ProfilePage     from './pages/user/ProfilePage';
import DashboardPage   from './pages/user/DashboardPage';
import NotFound        from './pages/NotFound';

import { ROUTES } from './utils/constants';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>

        {/* ── Toast Notifications ───────────────────────── */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181b',
              color: '#fafafa',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.9375rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              padding: '0.875rem 1.25rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#18181b' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#18181b' } },
          }}
        />

        <Routes>
          {/* ── Public pages ──────────────────────────────── */}
          <Route path={ROUTES.HOME} element={<HomePage />} />

          {/* ── Auth pages (redirect if logged in) ────────── */}
          <Route path={ROUTES.LOGIN}    element={<PublicRoute><LoginPage    /></PublicRoute>} />
          <Route path={ROUTES.REGISTER} element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* ── Protected user pages ──────────────────────── */}
          <Route path={ROUTES.PROFILE}   element={<ProtectedRoute><ProfilePage   /></ProtectedRoute>} />
          <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          {/* ── Admin pages (role-guarded) ─────────────────── */}
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <ProtectedRoute role="admin">
                {/* AdminDashboard coming soon */}
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* ── 404 ───────────────────────────────────────── */}
          <Route path="/404"  element={<NotFound />} />
          <Route path="*"     element={<Navigate to="/404" replace />} />
        </Routes>

      </Router>
    </Provider>
  );
}

export default App;
