import { useEffect, useState } from 'react';
import { companiesService } from '../services/companiesService';
import type { Company, CreateCompanyPayload } from '../services/companiesService';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companiesService.getAll();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (payload: CreateCompanyPayload) => {
    try {
      setError(null);
      await companiesService.create(payload);
      await fetchCompanies();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create company';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateCompany = async (id: number, payload: Partial<CreateCompanyPayload>) => {
    try {
      setError(null);
      await companiesService.update(id, payload);
      await fetchCompanies();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update company';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      setError(null);
      await companiesService.delete(id);
      await fetchCompanies();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete company';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
    refetch: fetchCompanies,
  };
};
