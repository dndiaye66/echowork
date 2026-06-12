import apiClient from '../api/Config';

export const entrepriseService = {
  getMyCompanies: async () => {
    const res = await apiClient.get('/users/me/companies');
    return res.data;
  },

  claim: async (companyId) => {
    const res = await apiClient.post(`/companies/${companyId}/claim`);
    return res.data;
  },

  unclaim: async (companyId) => {
    const res = await apiClient.delete(`/companies/${companyId}/claim`);
    return res.data;
  },

  getDashboard: async (companyId) => {
    const res = await apiClient.get(`/companies/${companyId}/dashboard`);
    return res.data;
  },

  updateProfile: async (companyId, data) => {
    const res = await apiClient.patch(`/companies/${companyId}/profile`, data);
    return res.data;
  },

  uploadLogo: async (companyId, file) => {
    const form = new FormData();
    form.append('logo', file);
    const res = await apiClient.post(`/companies/${companyId}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  uploadCover: async (companyId, file) => {
    const form = new FormData();
    form.append('cover', file);
    const res = await apiClient.post(`/companies/${companyId}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  addPhoto: async (companyId, file, caption = '') => {
    const form = new FormData();
    form.append('photo', file);
    if (caption) form.append('caption', caption);
    const res = await apiClient.post(`/companies/${companyId}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deletePhoto: async (companyId, photoId) => {
    const res = await apiClient.delete(`/companies/${companyId}/photos/${photoId}`);
    return res.data;
  },

  createBranch: async (companyId, data) => {
    const res = await apiClient.post(`/companies/${companyId}/branches`, data);
    return res.data;
  },

  createReply: async (reviewId, content) => {
    const res = await apiClient.post(`/reviews/${reviewId}/reply`, { content });
    return res.data;
  },

  updateReply: async (reviewId, content) => {
    const res = await apiClient.patch(`/reviews/${reviewId}/reply`, { content });
    return res.data;
  },

  deleteReply: async (reviewId) => {
    const res = await apiClient.delete(`/reviews/${reviewId}/reply`);
    return res.data;
  },
};
