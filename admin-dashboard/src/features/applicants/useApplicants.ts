import { useState, useEffect, useCallback, useMemo } from 'react';
import { applicantsService, normalizeApplicant, type Applicant, type ApplicationStatus, type Job } from './applicantsService';

function readError(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
  return typeof detail === 'string' ? detail : fallback;
}

export const useApplicants = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [sort, setSort] = useState<'recent' | 'match'>('recent');

  useEffect(() => {
    let active = true;
    applicantsService
      .getJobs()
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setJobs(list);
        if (list.length > 0) setSelectedJobId(list[0].id);
      })
      .catch((err) => active && setError(readError(err, 'تعذّر تحميل الوظائف.')));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedJobId === null) return;
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await applicantsService.getJobApplicants(selectedJobId);
        if (active) setApplicants((res.data.results ?? []).map(normalizeApplicant));
      } catch (err) {
        if (active) setError(readError(err, 'تعذّر تحميل المتقدمين.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [selectedJobId]);

  const updateStatus = useCallback(
    async (applicationId: number, status: ApplicationStatus) => {
      const previous = applicants;
      setApplicants((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status } : a)));
      try {
        await applicantsService.updateApplicationStatus(applicationId, status);
      } catch (err) {
        setApplicants(previous); // revert — never leave the UI lying about server state
        setError(readError(err, 'تعذّر تحديث حالة الطلب.'));
      }
    },
    [applicants],
  );

  const stats = useMemo(
    () => ({
      total: applicants.length,
      pending: applicants.filter((a) => a.status === 'PENDING').length,
      shortlisted: applicants.filter((a) => a.status === 'SHORTLISTED').length,
      accepted: applicants.filter((a) => a.status === 'ACCEPTED').length,
      rejected: applicants.filter((a) => a.status === 'REJECTED').length,
    }),
    [applicants],
  );

  const visibleApplicants = useMemo(() => {
    let list = statusFilter === 'ALL' ? [...applicants] : applicants.filter((a) => a.status === statusFilter);
    if (sort === 'match') list = [...list].sort((a, b) => (b.skill_match ?? -1) - (a.skill_match ?? -1));
    return list;
  }, [applicants, statusFilter, sort]);

  return {
    jobs,
    selectedJobId,
    setSelectedJobId,
    applicants: visibleApplicants,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    sort,
    setSort,
    updateStatus,
    stats,
  };
};
