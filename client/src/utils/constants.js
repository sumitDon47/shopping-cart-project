export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_USERS: '/admin/users',  ADMIN_PAYMENTS:  '/admin/payments',  ADMIN_ORDERS: '/admin/orders',  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  KHALTI_CALLBACK: '/payment/khalti/callback',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};