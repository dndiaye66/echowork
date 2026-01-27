// src/hooks/useHomeData.jsx
import { useApiData } from './useApi';
import { vitrineService } from '../services/vitrineService'; // à créer

export const useHomeData = () => {
  return useApiData(vitrineService.getHomeData);
};

export const useBestCompanies = () => {
  return useApiData(vitrineService.getBestCompanies);
};

export const useWorstCompanies = () => {
  return useApiData(vitrineService.getWorstCompanies);
};
