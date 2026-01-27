// src/hooks/useCompany.jsx
import { useEffect } from "react";
import { useApi } from "./useApi";
import { companyService } from "../services/companyService";

// Hook : entreprises d'une catégorie
export const useCompaniesByCategory = (categoryId) => {
  const { data, loading, error, execute } = useApi(companyService.getCompaniesByCategory);

  useEffect(() => {
    if (categoryId) {
      execute(categoryId);
    }
  }, [categoryId, execute]);

  return { companies: data || [], loading, error, refetch: () => execute(categoryId) };
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
