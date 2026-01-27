// src/services/reviewService.js
import apiClient from '../api/Config';

export const reviewService = {
  getCompanyReviews: async (companyId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/companies/${companyId}/reviews`, {
      params: { page, limit }
    });
    return response.data;
  },

  createReview: async (companyId, reviewData) => {
    const response = await apiClient.post(`/companies/${companyId}/reviews`, reviewData);
    return response.data;
  },

  getReviewById: async (reviewId) => {
    const response = await apiClient.get(`/reviews/${reviewId}`);
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};
