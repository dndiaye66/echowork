// src/services/reviewService.jsx
import apiClient from '../api/Config';

export const reviewService = {
  // Get all reviews for a company
  // GET /api/reviews/company/:companyId
  getCompanyReviews: async (companyId, rating = undefined) => {
    const params = rating ? { rating } : {};
    const response = await apiClient.get(`/reviews/company/${companyId}`, { params });
    return response.data;
  },

  // Create a new review (requires authentication)
  // POST /api/reviews
  createReview: async (reviewData) => {
    const response = await apiClient.post('/reviews', reviewData);
    return response.data;
  },

  // Get a single review by ID
  // GET /api/reviews/:id
  getReviewById: async (reviewId) => {
    const response = await apiClient.get(`/reviews/${reviewId}`);
    return response.data;
  },

  // Delete a review (requires authentication)
  // DELETE /api/reviews/:id
  deleteReview: async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};
