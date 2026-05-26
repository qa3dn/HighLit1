import { useState, useEffect, useCallback } from 'react';
import { projectsService, type Project, type ProjectStatus } from './projectsService';

const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'نظام إدارة المهام',
    description: 'تطبيق ويب لإدارة المهام اليومية مع خاصية السحب والإفلات وتصنيف المهام حسب الأولوية والوسوم.',
    tech_stack: ['React', 'TypeScript', 'TailwindCSS', 'Firebase'],
    status: 'COMPLETED',
    github_url: 'https://github.com',
    live_url: 'https://example.com',
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 2,
    title: 'منصة التجارة الإلكترونية',
    description: 'متجر إلكتروني كامل مع نظام سلة التسوق والدفع الآمن وإدارة المنتجات والطلبات.',
    tech_stack: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe'],
    status: 'IN_PROGRESS',
    github_url: 'https://github.com',
    live_url: '',
    created_at: '2026-04-15T10:00:00Z',
  },
  {
    id: 3,
    title: 'تطبيق تتبع النفقات',
    description: 'تطبيق موبايل لتتبع النفقات الشخصية مع رسوم بيانية تفاعلية وتقارير شهرية.',
    tech_stack: ['React Native', 'Expo', 'SQLite'],
    status: 'ARCHIVED',
    github_url: 'https://github.com',
    live_url: '',
    created_at: '2025-12-01T10:00:00Z',
  },
];

interface ProjectForm {
  title: string;
  description: string;
  tech_stack_input: string;
  status: ProjectStatus;
  github_url: string;
  live_url: string;
}

const EMPTY_FORM: ProjectForm = {
  title: '',
  description: '',
  tech_stack_input: '',
  status: 'IN_PROGRESS',
  github_url: '',
  live_url: '',
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal  = () => setIsModalOpen(true);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
    setFormError(null);
  }, []);

  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const updateField = useCallback(<K extends keyof ProjectForm>(key: K, val: ProjectForm[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError]       = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await projectsService.getProjects();
        const data = Array.isArray(res.data)
          ? res.data
          : ((res.data as unknown as { results: Project[] }).results ?? []);
        setProjects(data);
      } catch {
        setProjects(MOCK_PROJECTS);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const submitProject = useCallback(async () => {
    if (!form.title.trim())       return setFormError('عنوان المشروع مطلوب');
    if (!form.description.trim()) return setFormError('وصف المشروع مطلوب');

    setFormError(null);
    setIsSubmitting(true);

    const payload = {
      title:       form.title.trim(),
      description: form.description.trim(),
      tech_stack:  form.tech_stack_input.split(',').map(t => t.trim()).filter(Boolean),
      status:      form.status,
      github_url:  form.github_url.trim(),
      live_url:    form.live_url.trim(),
    };

    try {
      const res = await projectsService.createProject(payload);
      setProjects(prev => [res.data, ...prev]);
    } catch {
      const mock: Project = { id: Date.now(), ...payload, github_url: payload.github_url ?? '', live_url: payload.live_url ?? '', created_at: new Date().toISOString() };
      setProjects(prev => [mock, ...prev]);
    } finally {
      setIsSubmitting(false);
      closeModal();
    }
  }, [form, closeModal]);

  const deleteProject = useCallback(async (id: number) => {
    setDeletingId(id);
    try { await projectsService.deleteProject(id); } catch { /* fall through */ }
    finally {
      setProjects(prev => prev.filter(p => p.id !== id));
      setDeletingId(null);
    }
  }, []);

  const stats = {
    total:      projects.length,
    completed:  projects.filter(p => p.status === 'COMPLETED').length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    archived:   projects.filter(p => p.status === 'ARCHIVED').length,
  };

  return {
    projects, isLoading, error,
    isModalOpen, openModal, closeModal,
    form, updateField,
    isSubmitting, submitProject, formError,
    deletingId, deleteProject,
    stats,
  };
};
