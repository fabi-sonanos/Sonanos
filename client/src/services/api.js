import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (name, email, password, company) =>
    api.post('/auth/register', { name, email, password, company }),

  getMe: () =>
    api.get('/auth/me'),
};

// Leads API
export const leadsAPI = {
  getAll: () =>
    api.get('/leads'),

  getById: (id) =>
    api.get(`/leads/${id}`),

  getStats: () =>
    api.get('/leads/stats'),

  create: (leadData) =>
    api.post('/leads', leadData),

  update: (id, leadData) =>
    api.put(`/leads/${id}`, leadData),

  updateStatus: (id, status) =>
    api.patch(`/leads/${id}/status`, { status }),

  delete: (id) =>
    api.delete(`/leads/${id}`),

  addActivity: (id, activity_type, description) =>
    api.post(`/leads/${id}/activities`, { activity_type, description }),
};

export default api;
