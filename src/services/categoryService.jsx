// src/services/categoryService.jsx
import axios from '../api/Config';

export const categoryService = {
  /**
   * Get all categories from the backend
   * @returns {Promise} Promise resolving to array of categories
   */
  getAllCategories: async () => {
    const response = await axios.get('/categories');
    return response.data;
  },

  /**
   * Get category details with companies
   * @param {number|string} categoryId - Category ID or slug
   * @returns {Promise} Promise resolving to category details
   */
  getCategoryDetails: async (categoryId) => {
    const response = await axios.get(`/categories/${categoryId}`);
    return response.data;
  },

  /**
   * Search companies within a category
   * @param {number} categoryId - Category ID
   * @param {string} searchQuery - Search query
   * @returns {Promise} Promise resolving to search results
   */
  searchInCategory: async (categoryId, searchQuery) => {
    const response = await axios.get(`/categories/${categoryId}/search`, {
      params: { q: searchQuery }
    });
    return response.data;
  }
};
