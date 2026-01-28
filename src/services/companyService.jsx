// src/services/companyService.jsx
import apiClient from '../api/Config';

export const companyService = {
  // Recuperer les entreprises par categorie (slug)
  getCompaniesByCategory: async (categorySlug) => {
    const response = await apiClient.get(`/companies/category/slug/${categorySlug}`);
    return response.data;
  },

  // Recuperer les details d'une entreprise par ID
  getCompanyDetails: async (companyId) => {
    const response = await apiClient.get(`/companies/${companyId}`);
    return response.data;
  },

  // Recuperer les details d'une entreprise par slug
  getCompanyBySlug: async (companySlug) => {
    const response = await apiClient.get(`/companies/slug/${companySlug}`);
    return response.data;
  },

  // Recherche avec autocompletion
  searchAutocomplete: async (query, limit = 10) => {
    const response = await apiClient.get(`/companies/search/autocomplete`, {
      params: { q: query, limit }
    });
    return response.data;
  },
};
