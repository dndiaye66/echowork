import apiClient from '../api/Config';

export const jobsService = {
  getAll: async ({ q = '', categoryId = '', limit = 50 } = {}) => {
    const params = {};
    if (q) params.q = q;
    if (categoryId) params.categoryId = categoryId;
    if (limit) params.limit = limit;
    const res = await apiClient.get('/jobs', { params });
    return res.data;
  },
};
