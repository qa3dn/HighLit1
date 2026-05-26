import { useState, useEffect, useCallback } from 'react';
import { applicantsService, type Applicant, type Job } from './applicantsService';

// Mock data used until the backend endpoint is ready
const MOCK_JOBS: Job[] = [
  { id: 1, title: 'Frontend Developer', company: 'TechCorp', location: 'Riyadh' },
  { id: 2, title: 'Backend Engineer', company: 'TechCorp', location: 'Jeddah' },
];

const MOCK_APPLICANTS: Applicant[] = [
  {
    id: 1, job: 1, job_title: 'Frontend Developer',
    applicant_id: 10, applicant_name: 'Ahmed Ali', applicant_email: 'ahmed@example.com',
    cover_letter: 'I am very interested in this position.',
    status: 'PENDING', applied_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 2, job: 1, job_title: 'Frontend Developer',
    applicant_id: 11, applicant_name: 'Sara Hassan', applicant_email: 'sara@example.com',
    cover_letter: 'I have 3 years of React experience.',
    status: 'ACCEPTED', applied_at: '2026-05-19T08:30:00Z',
  },
  {
    id: 3, job: 1, job_title: 'Frontend Developer',
    applicant_id: 12, applicant_name: 'Omar Khaled', applicant_email: 'omar@example.com',
    cover_letter: '',
    status: 'REJECTED', applied_at: '2026-05-18T14:15:00Z',
  },
  {
    id: 4, job: 2, job_title: 'Backend Engineer',
    applicant_id: 13, applicant_name: 'Lina Nasser', applicant_email: 'lina@example.com',
    cover_letter: 'Django and Python expert.',
    status: 'PENDING', applied_at: '2026-05-21T09:00:00Z',
  },
];

export const useApplicants = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Applicant['status'] | 'ALL'>('ALL');

  // Fetch company's jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await applicantsService.getMyJobs();
        const list: Job[] = Array.isArray(res.data) ? res.data : (res.data as { results?: Job[] }).results ?? [];
        setJobs(list);
        if (list.length > 0) setSelectedJobId(list[0].id);
      } catch {
        // Backend not ready yet — use mock data
        setJobs(MOCK_JOBS);
        setSelectedJobId(MOCK_JOBS[0].id);
      }
    };
    fetchJobs();
  }, []);

  // Fetch applicants whenever selected job changes
  useEffect(() => {
    if (selectedJobId === null) return;
    const fetchApplicants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await applicantsService.getJobApplicants(selectedJobId);
        setApplicants(res.data);
      } catch {
        // Backend not ready yet — filter mock data by job
        setApplicants(MOCK_APPLICANTS.filter((a) => a.job === selectedJobId));
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplicants();
  }, [selectedJobId]);

  const updateStatus = useCallback(async (applicationId: number, status: Applicant['status']) => {
    if (selectedJobId === null) return;
    // Optimistic update
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
    );
    try {
      await applicantsService.updateApplicationStatus(selectedJobId, applicationId, status);
    } catch {
      // If API fails, the optimistic update stays (mock mode)
    }
  }, [selectedJobId]);

  const filteredApplicants = statusFilter === 'ALL'
    ? applicants
    : applicants.filter((a) => a.status === statusFilter);

  const stats = {
    total: applicants.length,
    pending: applicants.filter((a) => a.status === 'PENDING').length,
    accepted: applicants.filter((a) => a.status === 'ACCEPTED').length,
    rejected: applicants.filter((a) => a.status === 'REJECTED').length,
  };

  return {
    jobs,
    selectedJobId,
    setSelectedJobId,
    applicants: filteredApplicants,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    updateStatus,
    stats,
  };
};
