import { api } from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
};

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getSuggestions: (q) => api.get('/products/search-suggestions', { params: { q } }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
  getMine: () => api.get('/products/seller/mine'),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  update: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart'),
};

export const orderApi = {
  place: (data) => api.post('/orders', data),
  getMy: () => api.get('/orders/my'),
  getById: (id) => api.get(`/orders/${id}`),
  getSellerOrders: () => api.get('/orders/seller/mine'),
  updateStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
};

export const couponApi = {
  validate: (code, cartTotal) => api.post('/coupons/validate', { code, cartTotal }),
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  remove: (id) => api.delete(`/coupons/${id}`),
  toggleStatus: (id) => api.patch(`/coupons/${id}/toggle`),
};

export const reviewApi = {
  getForProduct: (productId) => api.get(`/reviews/${productId}`),
  add: (productId, data) => api.post(`/reviews/${productId}`, data),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export const paymentApi = {
  createOrder: (amount) => api.post('/payment/create-order', { amount }),
  verify: (data) => api.post('/payment/verify', data),
};

export const userApi = {
  updateProfile: (data) => api.put('/users/profile', data),
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (productId) => api.post(`/users/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/status`),
  getProducts: () => api.get('/admin/products'),
  getOrders: () => api.get('/admin/orders'),
};
