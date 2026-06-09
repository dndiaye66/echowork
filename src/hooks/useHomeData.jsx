// src/hooks/useHomeData.jsx
import { useApiData } from './useApi';
import { vitrineService } from '../services/vitrineService';

export const useHomeData = () => {
  return useApiData(vitrineService.getHomeData);
};

export const useBestCompanies = () => {
  return useApiData(vitrineService.getBestCompanies);
};

export const useWorstCompanies = () => {
  return useApiData(vitrineService.getWorstCompanies);
};

export const useActiveAds = () => {
  return useApiData(vitrineService.getActiveAds);
};

export const useStats = () => {
  return useApiData(vitrineService.getStats);
};

export const useJobOffers = () => {
  return useApiData(vitrineService.getJobOffers);
};

export const useRecentReviews = () => {
  return useApiData(vitrineService.getRecentReviews);
};

export const useBarometer = () => {
  return useApiData(vitrineService.getBarometer);
};
