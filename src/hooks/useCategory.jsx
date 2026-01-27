// src/hooks/useCategory.jsx
import { useApiData } from './useApi';
import { CategoryPage } from '../pages/CategoryPage';

export const useCategories = () => {
  return useApiData(CategoryPage .getAllCategories);
};