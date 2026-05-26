import { useState, useEffect, useCallback } from 'react';
import { jobsService, type Job, type CreateJobPayload } from './jobsService';

const MOCK_JOBS: Job[] = [
  {
    id: 1, title: 'Frontend Developer', company: 'TechCorp', location: 'Riyadh',
    description: 'We are looking for an experienced React developer to join our team.',
    min_salary: 8000, max_salary: 12000, created_by: 99, created_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 2, title: 'Backend Engineer', company: 'TechCorp', location: 'Jeddah',
    description: 'Python/Django engineer needed for our platform team.',
    min_salary: 10000, max_salary: 15000, created_by: 99, created_at: '2026-05-18T08:00:00Z',
  },
  {
    id: 3, title: 'UI/UX Designer', company: 'TechCorp', location: 'Remote',
    description: 'Creative designer to shape product experience.',
    min_salary: 7000, max_salary: 11000, created_by: 99, created_at: '2026-05-15T12:00:00Z',
  },
];

const EMPTY_FORM: CreateJobPayload = {
  title: '', company: '', location: '', description: '', min_salary: 0, max_salary: 0,
};

export const useJobs = () => {
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [form, setForm]           = useState<CreateJobPayload>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await jobsService.getJobs();
      const list: Job[] = Array.isArray(res.data)
        ? res.data
        : (res.data as { results?: Job[] }).results ?? [];
      setJobs(list);
    } catch {
      setJobs(MOCK_JOBS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const openModal  = () => { setForm(EMPTY_FORM); setFormError(null); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  const updateField = (field: keyof CreateJobPayload, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const submitJob = async () => {
    if (!form.title.trim() || !form.company.trim() || !form.description.trim()) {
      setFormError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (form.min_salary > form.max_salary) {
      setFormError('الحد الأدنى للراتب يجب أن يكون أقل من الحد الأقصى');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await jobsService.createJob(form);
      setJobs((prev) => [res.data, ...prev]);
      closeModal();
    } catch {
      // mock: add locally with a fake id
      const mockNew: Job = {
        ...form, id: Date.now(), created_by: 99, created_at: new Date().toISOString(),
      };
      setJobs((prev) => [mockNew, ...prev]);
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteJob = async (id: number) => {
    setDeletingId(id);
    try {
      await jobsService.deleteJob(id);
    } catch {
      // mock: remove locally regardless
    } finally {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setDeletingId(null);
    }
  };

  return {
    jobs, isLoading, error,
    isModalOpen, openModal, closeModal,
    form, updateField,
    isSubmitting, submitJob, formError,
    deletingId, deleteJob,
  };
};
