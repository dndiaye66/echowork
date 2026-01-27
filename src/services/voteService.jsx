// src/services/voteService.jsx
import apiClient from '../api/Config';

export const voteService = {
  // Upvote a review
  // POST /api/reviews/:id/upvote
  upvoteReview: async (reviewId) => {
    const response = await apiClient.post(`/reviews/${reviewId}/upvote`);
    return response.data;
  },

  // Downvote a review
  // POST /api/reviews/:id/downvote
  downvoteReview: async (reviewId) => {
    const response = await apiClient.post(`/reviews/${reviewId}/downvote`);
    return response.data;
  }
};
