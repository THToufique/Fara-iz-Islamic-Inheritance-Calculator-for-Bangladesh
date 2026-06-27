// lib/api.js
// Centralized API helper using fetch
// All backend calls go through here so base URL is in one place
// Tested: auth header attaches correctly, error responses surface message ✓

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Get stored JWT token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('faraiz_token');
  }
  return null;
};

// Core fetch wrapper
const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Auth API
export const authAPI = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  updateProfile: (body) => request('/api/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),
};

// Calculator API
export const calculatorAPI = {
  calculate: (body) => request('/api/calculate', { method: 'POST', body: JSON.stringify(body) }),
};

// Saved calculations API
export const calculationsAPI = {
  getAll: () => request('/api/calculations'),
  getOne: (id) => request(`/api/calculations/${id}`),
  save: (body) => request('/api/calculations', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id) => request(`/api/calculations/${id}`, { method: 'DELETE' }),
};

// Professionals API
export const professionalsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/professionals${query ? '?' + query : ''}`);
  },
  getOne: (id) => request(`/api/professionals/${id}`),
  register: (body) => request('/api/professionals', { method: 'POST', body: JSON.stringify(body) }),
  addReview: (id, body) =>
    request(`/api/professionals/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
};

// Articles API
export const articlesAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/articles${query ? '?' + query : ''}`);
  },
  getOne: (slug) => request(`/api/articles/${slug}`),
};

// Admin API
export const adminAPI = {
  getStats: () => request('/api/admin/stats'),
  getPendingProfessionals: () => request('/api/admin/professionals/pending'),
  approveProfessional: (id) =>
    request(`/api/admin/professionals/${id}/approve`, { method: 'PATCH' }),
  removeProfessional: (id) =>
    request(`/api/admin/professionals/${id}`, { method: 'DELETE' }),
  getUsers: () => request('/api/admin/users'),
  deactivateUser: (id) =>
    request(`/api/admin/users/${id}/deactivate`, { method: 'PATCH' }),
  createArticle: (body) =>
    request('/api/articles', { method: 'POST', body: JSON.stringify(body) }),
  updateArticle: (id, body) =>
    request(`/api/articles/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteArticle: (id) =>
    request(`/api/articles/${id}`, { method: 'DELETE' }),
};

// PDF download
export const downloadPDF = async (input, label = '') => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/pdf/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ input, label }),
  });

  if (!response.ok) throw new Error('PDF generation failed');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `faraiz-report-${Date.now()}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
};
