// src/hooks/useCategory.jsx
import { useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { categoryService } from '../services/categoryService';

/**
 * Hook to fetch all categories from the backend
 * @returns {Object} { categories, loading, error, refetch }
 */
export const useCategories = () => {
  const { data, loading, error, execute } = useApi(categoryService.getAllCategories);

  // Use useCallback to memoize the fetch function
  const fetchCategories = useCallback(() => {
    execute();
  }, [execute]);

  useEffect(() => {
    fetchCategories();
  }, []); // Empty dependency array - only fetch once on mount

  return { 
    categories: data || [], 
    loading, 
    error, 
    refetch: fetchCategories 
  };
};