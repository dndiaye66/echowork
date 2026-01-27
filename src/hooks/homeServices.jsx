// src/services/homeService.js
import apiClient from './config';

export const homeService = {
  // Données de la page d'accueil
  getHomeData: async () => {
    const response = await apiClient.get('/home');
    return response.data;
  },
  
  // Meilleures entreprises
  getBestCompanies: async () => {
    const response = await apiClient.get('/home/best-companies');
    return response.data;
  },
  
  // Entreprises en baisse
  getWorstCompanies: async () => {
    const response = await apiClient.get('/home/worst-companies');
    return response.data;
  },
  
  // Publicités
  getAds: async () => {
    const response = await apiClient.get('/home/ads');
    return response.data;
  }
};

// src/pages/CategoryPage.jsx
export const categoryService = {
  //  Récupérer toutes les catégories
  getAllCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },
  
  // Récupérer une catégorie spécifique (si besoin)
  getCategoryById: async (categoryId) => {
    const response = await apiClient.get(`/categories/${categoryId}`);
    return response.data;
  }
};

// src/pages/CategoryPage.jsx
export const companyService = {
  // Récupérer toutes les entreprises
  getAllCompanies: async () => {
    const response = await apiClient.get('/companies');
    return response.data;
  },
  
  // Entreprises par catégorie (triées par note)
  getCompaniesByCategory: async (categoryId) => {
    const response = await apiClient.get(`/companies/category/${categoryId}`);
    return response.data;
  },
  
  // Détails d'une entreprise
  getCompanyDetails: async (companyId) => {
    const response = await apiClient.get(`/companies/${companyId}`);
    return response.data;
  },
  
  // Statistiques d'une entreprise
  getCompanyStats: async (companyId) => {
    const response = await apiClient.get(`/companies/${companyId}/stats`);
    return response.data;
  },
  
  // Rechercher des entreprises
  searchCompanies: async (query) => {
    const response = await apiClient.get('/companies/search', {
      params: { q: query }
    });
    return response.data;
  }
};

// src/pages/CompanyPage.jsx
export const reviewService = {
  // Récupérer les avis d'une entreprise
  getCompanyReviews: async (companyId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/companies/${companyId}/reviews`, {
      params: { page, limit }
    });
    return response.data;
  },
  
  // Créer un nouvel avis
  createReview: async (companyId, reviewData) => {
    const response = await apiClient.post(`/companies/${companyId}/reviews`, reviewData);
    return response.data;
  },
  
  // Récupérer un avis spécifique
  getReviewById: async (reviewId) => {
    const response = await apiClient.get(`/reviews/${reviewId}`);
    return response.data;
  },
  
  // Supprimer un avis (si autorisé)
  deleteReview: async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};

// src/pages/CompanyPage.jsx
export const voteService = {
  // Voter positivement pour un avis
  upvoteReview: async (reviewId) => {
    const response = await apiClient.post(`/reviews/${reviewId}/vote`, {
      type: 'upvote'
    });
    return response.data;
  },
  
  // Voter négativement pour un avis
  downvoteReview: async (reviewId) => {
    const response = await apiClient.post(`/reviews/${reviewId}/vote`, {
      type: 'downvote'
    });
    return response.data;
  },
  
  // Récupérer les votes d'un avis
  getReviewVotes: async (reviewId) => {
    const response = await apiClient.get(`/reviews/${reviewId}/votes`);
    return response.data;
  },
  
  // Annuler un vote
  removeVote: async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}/vote`);
    return response.data;
  }
};

// src/pages/VitrinePage.jsx
export const adService = {
  // Récupérer les publicités
  getAds: async (position = 'sidebar') => {
    const response = await apiClient.get('/ads', {
      params: { position }
    });
    return response.data;
  },
  
  // Récupérer les offres d'emploi
  getJobOffers: async () => {
    const response = await apiClient.get('/jobs');
    return response.data;
  }
};