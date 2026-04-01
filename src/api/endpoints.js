import api from './axios';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  adminLogin: (data) => api.post('/admin/login', data),
};

// ── Packages ──────────────────────────────────────────────────────────────────
export const packagesAPI = {
  list: (params) => api.get('/packages-v2', { params }),
  getById: (id) => api.get(`/packages-v2/${id}`),
  getBySlug: (slug) => api.get(`/packages-v2/slug/${slug}`),
  create: (formData) => api.post('/packages-v2', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/packages-v2/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/packages-v2/${id}`),
};

// ── Activities ────────────────────────────────────────────────────────────────
export const activitiesAPI = {
  list: (params) => api.get('/activities-v2', { params }),
  getById: (id) => api.get(`/activities-v2/${id}`),
  getBySlug: (slug) => api.get(`/activities-v2/slug/${slug}`),
  create: (formData) => api.post('/activities-v2', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/activities-v2/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/activities-v2/${id}`),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingsAPI = {
  listAll: (params) => api.get('/bookings-v2', { params }),
  listMine: () => api.get('/bookings-v2/me'),
  create: (data) => api.post('/bookings-v2', data),
  updateDetails: (id, data) => api.put(`/bookings-v2/${id}`, data),
  updateStatus: (id, data) => api.put(`/bookings-v2/${id}/status`, data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  updateRole: (id, data) => api.put(`/users/${id}/role`, data),
};

// ── Banners ───────────────────────────────────────────────────────────────────
export const bannersAPI = {
  list: () => api.get('/banners'),
  create: (formData) => api.post('/banners', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/banners/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/banners/${id}`),
};

// ── Custom Requests ───────────────────────────────────────────────────────────
export const customRequestsAPI = {
  listAll: (params) => api.get('/custom-requests-v2', { params }),
  listMine: (params) => api.get('/custom-requests-v2/me', { params }),
  create: (data) => api.post('/custom-requests-v2', data),
  updateStatus: (id, data) => api.put(`/custom-requests-v2/${id}/status`, data),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  listByPackage: (packageId) => api.get(`/reviews/package/${packageId}`),
  add: (data) => api.post('/reviews', data),
};

// ── Activity Slots ────────────────────────────────────────────────────────────
export const slotsAPI = {
  list: (params) => api.get('/activity-slots', { params }),
  create: (data) => api.post('/activity-slots', data),
  update: (id, data) => api.put(`/activity-slots/${id}`, data),
  delete: (id) => api.delete(`/activity-slots/${id}`),
};

// ── Package-Activity Mappings ─────────────────────────────────────────────────
export const mappingsAPI = {
  list: (params) => api.get('/package-activity-mappings', { params }),
  create: (data) => api.post('/package-activity-mappings', data),
  delete: (id) => api.delete(`/package-activity-mappings/${id}`),
};

// ── Home Media (via legacy admin routes) ──────────────────────────────────────
export const homeMediaAPI = {
  list: (params) => api.get('/admin/home-media', { params }),
  getById: (id) => api.get(`/admin/home-media/${id}`),
  create: (formData) => api.post('/admin/home-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/admin/home-media/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/admin/home-media/${id}`),
};

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartAPI = {
  listMine: () => api.get('/cart/me'),
  createOrUpdate: (data) => api.post('/cart/me', data),
  clearMine: () => api.delete('/cart/me'),
};

// ── Public API ───────────────────────────────────────────────────────────────────
export const publicAPI = {
  getActivities: () => api.get('/public/activities'),
  getPackages: () => api.get('/public/packages'),
  getHomeMedia: () => api.get('/public/home-media'),
  createCustomRequest: (data) => api.post('/public/custom-requests', data),
  createBooking: (data) => api.post('/public/bookings', data),
};

// ── Client Auth API ───────────────────────────────────────────────────────────────────
export const clientAPI = {
  save: (data) => api.post('/client/save', data),
  login: (data) => api.post('/client/login', data),
};
