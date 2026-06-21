// src/services/vitrineService.jsx
import apiClient from '../api/Config'; // Assure-toi que ce chemin est correct et que le fichier s'appelle bien Config.js

export const vitrineService = {
  getHomeData: async () => {
    try {
      const res = await apiClient.get('/home');
      return res.data;
    } catch (error) {
      console.error("Erreur lors du chargement des données de la vitrine :", error);
      throw error;
    }
  },

  getBestCompanies: async () => {
    try {
      const res = await apiClient.get('/home/best-companies');
      return res.data;
    } catch (error) {
      console.error("Erreur lors du chargement des meilleures entreprises :", error);
      throw error;
    }
  },

  getWorstCompanies: async () => {
    try {
      const res = await apiClient.get('/home/worst-companies');
      return res.data;
    } catch (error) {
      console.error("Erreur lors du chargement des pires entreprises :", error);
      throw error;
    }
  },

  getActiveAds: async () => {
    try {
      const res = await apiClient.get('/advertisements/active');
      return res.data;
    } catch {
      return [];
    }
  },

  getStats: async () => {
    try {
      const res = await apiClient.get('/home/stats');
      return res.data;
    } catch {
      return { companyCount: 3500, categoryCount: 15, reviewCount: 500, userCount: 1000 };
    }
  },

  getJobOffers: async () => {
    try {
      const res = await apiClient.get('/home/job-offers');
      return res.data;
    } catch {
      return [];
    }
  },

  getRecentReviews: async (limit) => {
    try {
      const res = await apiClient.get('/home/recent-reviews', limit ? { params: { limit } } : undefined);
      return res.data;
    } catch {
      return [];
    }
  },

  getBarometer: async () => {
    try {
      const res = await apiClient.get('/home/barometer');
      return res.data;
    } catch {
      return [];
    }
  },
};
