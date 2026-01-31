// src/hooks/useCategory.jsx
import { useEffect } from 'react';
import { useApi } from './useApi';
import { categoryService } from '../services/categoryService';

/**
 * Hook to fetch all categories from the backend
 * @returns {Object} { categories, loading, error, refetch }
 */
export const useCategories = () => {
  const { data, loading, error, execute } = useApi(categoryService.getAllCategories);

  useEffect(() => {
    execute();
  }, [execute]);

  return { 
    categories: data || [], 
    loading, 
    error, 
    refetch: execute 
  };
};