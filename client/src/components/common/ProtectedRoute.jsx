import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../utils/constants';

/**
 * ProtectedRoute
 * Wraps any page that requires authentication.
 * Optionally requires a specific role (e.g. "admin").
 *
 * Usage:
 *   <ProtectedRoute><ProfilePage /></ProtectedRoute>
 *   <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
 */
const ProtectedRoute = ({ children, role }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Not logged in → redirect to login, remember where they were
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to home
  if (role && user?.role !== role) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

/**
 * PublicRoute
 * Redirects already-authenticated users away from auth pages.
 *
 * Usage:
 *   <PublicRoute><LoginPage /></PublicRoute>
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    const destination =
      user?.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.HOME;
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default ProtectedRoute;
