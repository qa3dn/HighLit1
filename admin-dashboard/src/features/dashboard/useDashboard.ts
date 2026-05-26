import { useState, useEffect } from 'react';
import { dashboardService } from './dashboardService';
import type { Applicant, Job } from '../applicants/applicantsService';

type JobWithCount = Job & { applicant_count: number };

// Mock data — active until the backend applicants endpoint is ready
const MOCK_JOBS: Job[] = [
  { id: 1, title: 'Frontend Developer', company: 'TechCorp', location: 'Riyadh' },
  { id: 2, title: 'Backend Engineer',   company: 'TechCorp', location: 'Jeddah' },
  { id: 3, title: 'UI/UX Designer',     company: 'TechCorp', location: 'Remote'  },
];

const MOCK_APPLICANTS: Applicant[] = [
  { id: 1, job: 1, job_title: 'Frontend Developer', applicant_id: 10, applicant_name: 'Ahmed Ali',    applicant_email: 'ahmed@example.com', cover_letter: '', status: 'PENDING',  applied_at: '2026-05-24T10:00:00Z' },
  { id: 2, job: 1, job_title: 'Frontend Developer', applicant_id: 11, applicant_name: 'Sara Hassan',  applicant_email: 'sara@example.com',  cover_letter: '', status: 'ACCEPTED', applied_at: '2026-05-23T08:30:00Z' },
  { id: 3, job: 1, job_title: 'Frontend Developer', applicant_id: 12, applicant_name: 'Omar Khaled',  applicant_email: 'omar@example.com',  cover_letter: '', status: 'REJECTED', applied_at: '2026-05-22T14:00:00Z' },
  { id: 4, job: 2, job_title: 'Backend Engineer',   applicant_id: 13, applicant_name: 'Lina Nasser',  applicant_email: 'lina@example.com',  cover_letter: '', status: 'PENDING',  applied_at: '2026-05-25T09:00:00Z' },
  { id: 5, job: 2, job_title: 'Backend Engineer',   applicant_id: 14, applicant_name: 'Yousef Salem', applicant_email: 'yousef@example.com', cover_letter: '', status: 'PENDING', applied_at: '2026-05-25T11:00:00Z' },
  { id: 6, job: 3, job_title: 'UI/UX Designer',     applicant_id: 15, applicant_name: 'Hana Rami',   applicant_email: 'hana@example.com',  cover_letter: '', status: 'ACCEPTED', applied_at: '2026-05-21T07:00:00Z' },
];

export const useDashboard = () => {
  const [jobs, setJobs]                       = useState<JobWithCount[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading]             = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const jobsRes = await dashboardService.getMyJobs();
        const rawJobs: Job[] = Array.isArray(jobsRes.data)
          ? jobsRes.data
          : (jobsRes.data as { results?: Job[] }).results ?? [];

        // Fetch applicants for each job in parallel
        const results = await Promise.allSettled(
          rawJobs.map((j) => dashboardService.getJobApplicants(j.id))
        );

        const allApplicants: Applicant[] = [];
        const jobsWithCount: JobWithCount[] = rawJobs.map((job, i) => {
          const res = results[i];
          const applicants: Applicant[] =
            res.status === 'fulfilled'
              ? Array.isArray(res.value.data)
                ? res.value.data
                : (res.value.data as { results?: Applicant[] }).results ?? []
              : [];
          allApplicants.push(...applicants);
          return { ...job, applicant_count: applicants.length };
        });

        setJobs(jobsWithCount);
        setRecentApplicants(
          allApplicants.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()).slice(0, 5)
        );
      } catch {
        // Backend not ready — use mock data
        const jobsWithCount: JobWithCount[] = MOCK_JOBS.map((job) => ({
          ...job,
          applicant_count: MOCK_APPLICANTS.filter((a) => a.job === job.id).length,
        }));
        setJobs(jobsWithCount);
        setRecentApplicants(
          [...MOCK_APPLICANTS].sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()).slice(0, 5)
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const stats = {
    totalJobs:        jobs.length,
    totalApplicants:  recentApplicants.length > 0 ? jobs.reduce((s, j) => s + j.applicant_count, 0) : 0,
    pending:          MOCK_APPLICANTS.filter((a) => a.status === 'PENDING').length,
    accepted:         MOCK_APPLICANTS.filter((a) => a.status === 'ACCEPTED').length,
    rejected:         MOCK_APPLICANTS.filter((a) => a.status === 'REJECTED').length,
  };

  return { jobs, recentApplicants, stats, isLoading };
};
