import { useState, useEffect, useCallback } from 'react';
import { savedService, type SavedJob } from './savedService';

const MOCK_SAVED: SavedJob[] = [
  {
    id: 1,
    job_id: 101,
    title: 'Frontend Developer',
    company: 'TechVision SA',
    location: 'الرياض',
    description: 'نبحث عن مطور واجهات متمرس لبناء تجارب مستخدم استثنائية باستخدام React وTypeScript.',
    min_salary: 10000,
    max_salary: 16000,
    saved_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 2,
    job_id: 102,
    title: 'Full Stack Engineer',
    company: 'CloudBase',
    location: 'جدة',
    description: 'نطلب مهندسًا full-stack للعمل على تطوير منصتنا السحابية بـ Node.js وReact.',
    min_salary: 12000,
    max_salary: 20000,
    saved_at: '2026-05-18T08:30:00Z',
  },
  {
    id: 3,
    job_id: 103,
    title: 'UI/UX Designer',
    company: 'Pixel Studio',
    location: 'عن بُعد',
    description: 'مصمم إبداعي لتصميم واجهات تطبيقات الجوال والويب وفق أحدث معايير تجربة المستخدم.',
    min_salary: 8000,
    max_salary: 13000,
    saved_at: '2026-05-15T14:00:00Z',
  },
  {
    id: 4,
    job_id: 104,
    title: 'Backend Developer',
    company: 'DataCore Systems',
    location: 'الدمام',
    description: 'مطور خلفية لبناء APIs قابلة للتوسع باستخدام Python/Django وPostgreSQL.',
    min_salary: 11000,
    max_salary: 17000,
    saved_at: '2026-05-12T09:15:00Z',
  },
];

export const useSaved = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [unsavingId, setUnsavingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await savedService.getSavedJobs();
        const data = Array.isArray(res.data)
          ? res.data
          : ((res.data as unknown as { results: SavedJob[] }).results ?? []);
        setSavedJobs(data);
      } catch {
        setSavedJobs(MOCK_SAVED);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const unsaveJob = useCallback(async (id: number) => {
    setUnsavingId(id);
    try { await savedService.unsaveJob(id); } catch { /* fall through */ }
    finally {
      setSavedJobs(prev => prev.filter(j => j.id !== id));
      setUnsavingId(null);
    }
  }, []);

  return { savedJobs, isLoading, error, unsavingId, unsaveJob };
};
