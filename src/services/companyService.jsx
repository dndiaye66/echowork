// src/services/companyService.jsx
import apiClient from '../api/Config';

export const companyService = {
  // Récupérer les entreprises par catégorie (slug)
  getCompaniesByCategory: async (categorySlug) => {
    const response = await apiClient.get(`/companies/category/slug/${categorySlug}`);
    return response.data;
  },

  // Récupérer les détails d’une entreprise
  getCompanyDetails: async (companyId) => {
    const response = await apiClient.get(`/companies/${companyId}`);
    return response.data;
  },
};
