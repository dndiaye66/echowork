// src/hooks/useCompany.jsx
import { useEffect } from "react";
import { useApi } from "./useApi";
import { companyService } from "../services/companyService";

// Hook : entreprises d'une catégorie (par slug)
export const useCompaniesByCategory = (categorySlug) => {
  const { data, loading, error, execute } = useApi(companyService.getCompaniesByCategory);

  useEffect(() => {
    if (categorySlug) {
      execute(categorySlug);
    }
  }, [categorySlug, execute]);

  return { companies: data || [], loading, error, refetch: () => execute(categorySlug) };
};

// Hook : détails d'une entreprise
export const useCompanyDetails = (companyId) => {
  const { data, loading, error, execute } = useApi(companyService.getCompanyDetails);

  useEffect(() => {
    if (companyId) {
      execute(companyId);
    }
  }, [companyId, execute]);

  return { company: data, loading, error, refetch: () => execute(companyId) };
};
