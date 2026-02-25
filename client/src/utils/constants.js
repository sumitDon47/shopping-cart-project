export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  PRODUCTS: '/products',
  CART: '/cart',
  ORDERS: '/orders',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};