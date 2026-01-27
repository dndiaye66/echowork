// src/hooks/useReviews.js

import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { reviewService } from '../services/reviewService';

export const useCompanyReviews = (companyId) => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const { loading, error, execute } = useApi(reviewService.getCompanyReviews);

  const loadReviews = useCallback(async (pageNum = 1, reset = false) => {
    try {
      const newReviews = await execute(companyId, pageNum);
      if (reset || pageNum === 1) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }
      setPage(pageNum);
    } catch (err) {
      console.error('Erreur chargement avis:', err);
    }
  }, [companyId, execute]);

  useEffect(() => {
    if (companyId) {
      loadReviews(1, true);
    }
  }, [companyId, loadReviews]);

  const loadMore = () => loadReviews(page + 1);
  const refresh = () => loadReviews(1, true);

  return { reviews, loading, error, loadMore, refresh, page };
};
