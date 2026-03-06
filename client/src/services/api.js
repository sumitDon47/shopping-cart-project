import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect for public auth endpoints — let the component handle those errors
      const url = error.config?.url || '';
      const publicAuthPaths = ['/auth/login', '/auth/send-otp', '/auth/verify-otp', '/auth/resend-otp', '/auth/forgot-password', '/auth/reset-password', '/auth/google'];
      const isPublicAuth = publicAuthPaths.some((p) => url.endsWith(p));

      if (!isPublicAuth) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        toast.error('Session expired. Please login again.');
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  sendOTP:        (data) => api.post('/auth/send-otp', data),
  verifyOTP:      (data) => api.post('/auth/verify-otp', data),
  resendOTP:      (data) => api.post('/auth/resend-otp', data),
  login:          (data) => api.post('/auth/login', data),
  google:         (data) => api.post('/auth/google', data),
  googleLink:     (data) => api.put('/auth/google-link', data),
  getMe:          ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
  deleteAccount:  ()     => api.delete('/auth/me'),
};

// ── User ──────────────────────────────────────────────────
export const userAPI = {
  getProfile:     ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile', data),
};

// ── Products ──────────────────────────────────────────────
export const productAPI = {
  getAll:         (params) => api.get('/products', { params }),
  getById:        (id)     => api.get(`/products/${id}`),
  getTop:         ()       => api.get('/products/top'),
  getCategories:  ()       => api.get('/products/categories'),
  create:    (data)   => api.post('/products', data),
  update:    (id, data) => api.put(`/products/${id}`, data),
  delete:    (id)     => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

// ── Cart ──────────────────────────────────────────────────
export const cartAPI = {
  get:        ()              => api.get('/cart'),
  add:        (data)          => api.post('/cart', data),
  update:     (itemId, data)  => api.put(`/cart/${itemId}`, data),
  remove:     (itemId)        => api.delete(`/cart/${itemId}`),
  clear:      ()              => api.delete('/cart'),
};

// ── Orders ────────────────────────────────────────────────
export const orderAPI = {
  create:      (data) => api.post('/orders', data),
  buyNow:      (data) => api.post('/orders/buy-now', data),
  getMyOrders: ()     => api.get('/orders/myorders'),
  getById:     (id)   => api.get(`/orders/${id}`),
  getAll:      ()     => api.get('/orders'),
  updateStatus:(id, data) => api.put(`/orders/${id}/status`, data),
  pay:         (id, data) => api.put(`/orders/${id}/pay`, data),
};

// ── Payment ───────────────────────────────────────────────
export const paymentAPI = {
  khaltiInitiate: (data) => api.post('/payment/khalti/initiate', data),
  khaltiVerify:   (data) => api.post('/payment/khalti/verify', data),
};

// ── Admin ─────────────────────────────────────────────────
export const adminAPI = {
  getStats:      ()     => api.get('/admin/stats'),
  getUsers:      ()     => api.get('/admin/users'),
  deleteUser:    (id)   => api.delete(`/admin/users/${id}`),
  getPaidOrders: ()     => api.get('/admin/payments'),
  getAllOrders:  ()     => api.get('/orders'),
};

export default api;
