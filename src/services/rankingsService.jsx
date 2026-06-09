import apiClient from '../api/Config';

export const rankingsService = {
  getByCategory: (slug, limit = 10) =>
    apiClient.get('/rankings', { params: { type: 'category', slug, limit } }).then(r => r.data),

  getByCity: (city, limit = 10) =>
    apiClient.get('/rankings', { params: { type: 'city', city, limit } }).then(r => r.data),

  getCategories: () =>
    apiClient.get('/rankings/categories').then(r => r.data),
};

export const analyticsService = {
  trackView: (companyId, source = 'direct') =>
    apiClient.post(`/companies/${companyId}/view`, null, { params: { source } }).catch(() => {}),

  getAnalytics: (companyId) =>
    apiClient.get(`/companies/${companyId}/analytics`).then(r => r.data),

  getAnalysis: (companyId) =>
    apiClient.get(`/companies/${companyId}/analysis`).then(r => r.data),

  generateAnalysis: (companyId) =>
    apiClient.post(`/companies/${companyId}/analysis/generate`).then(r => r.data),
};

export const reportsService = {
  create: (data) =>
    apiClient.post('/reports', data).then(r => r.data),

  getAll: (status) =>
    apiClient.get('/reports', { params: status ? { status } : {} }).then(r => r.data),

  getByCompany: (companyId) =>
    apiClient.get(`/reports/company/${companyId}`).then(r => r.data),

  updateStatus: (id, status, moderatorNote) =>
    apiClient.patch(`/reports/${id}/status`, { status, moderatorNote }).then(r => r.data),
};
