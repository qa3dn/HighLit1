import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import {
  hideProject,
  listProjects,
  rejectProject,
  type ProjectFilters,
  type StudentProject,
} from '../../../services/studentProjects';

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'منشور',
  HIDDEN: 'مخفي',
  REJECTED: 'مرفوض',
};

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PUBLISHED: 'success',
  HIDDEN: 'warning',
  REJECTED: 'danger',
};

const ProjectsReviewPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const {
    data: projects = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-projects', filters],
    queryFn: () => listProjects(filters),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-projects'] });

  const hideMutation = useMutation({ mutationFn: (id: number) => hideProject(id), onSuccess: invalidate });
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectProject(id, reason),
    onSuccess: () => {
      setRejectId(null);
      setRejectReason('');
      invalidate();
    },
  });

  const universityOptions = [
    { value: '', label: 'كل الجامعات' },
    ...[...new Set(projects.map((p) => p.university))].map((u) => ({ value: u, label: u })),
  ];
  const majorOptions = [
    { value: '', label: 'كل التخصصات' },
    ...[...new Set(projects.map((p) => p.major))].map((m) => ({ value: m, label: m })),
  ];

  const columns: Column<StudentProject>[] = [
    { key: 'title', header: 'المشروع', render: (p) => <span className="font-medium text-text">{p.title}</span> },
    { key: 'author', header: 'الطالب', render: (p) => <span className="text-text-secondary">{p.author?.username || '—'}</span> },
    { key: 'university', header: 'الجامعة', render: (p) => <span className="text-text-secondary">{p.university}</span> },
    { key: 'major', header: 'التخصص', render: (p) => <span className="text-text-secondary">{p.major}</span> },
    {
      key: 'status',
      header: 'الحالة',
      render: (p) => (
        <Badge variant={STATUS_VARIANT[p.status] ?? 'default'}>{STATUS_LABEL[p.status] ?? p.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (p) =>
        p.status === 'PUBLISHED' ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => hideMutation.mutate(p.id)}
              className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent"
            >
              إخفاء
            </button>
            <button
              type="button"
              onClick={() => setRejectId(p.id)}
              className="rounded border border-red-500/50 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
            >
              رفض
            </button>
          </div>
        ) : (
          <span className="text-xs text-text-secondary">—</span>
        ),
    },
  ];

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text">مراجعة مشاريع الطلاب</h1>

      <div className="flex flex-wrap items-end gap-3">
        <input
          type="search"
          placeholder="بحث..."
          value={filters.q || ''}
          onChange={(e) => setFilters({ ...filters, q: e.target.value || undefined })}
          className="rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent"
        />
        <Select
          value={filters.university || ''}
          onChange={(e) => setFilters({ ...filters, university: e.target.value || undefined })}
          options={universityOptions}
        />
        <Select
          value={filters.major || ''}
          onChange={(e) => setFilters({ ...filters, major: e.target.value || undefined })}
          options={majorOptions}
        />
        <Select
          value={filters.status || ''}
          onChange={(e) =>
            setFilters({ ...filters, status: (e.target.value as ProjectFilters['status']) || undefined })
          }
          options={[
            { value: '', label: 'كل الحالات' },
            { value: 'PUBLISHED', label: 'منشور' },
            { value: 'HIDDEN', label: 'مخفي' },
            { value: 'REJECTED', label: 'مرفوض' },
          ]}
        />
      </div>

      {isError ? (
        <p className="text-red-400">تعذّر تحميل المشاريع. تأكد من تسجيل الدخول كمسؤول (ADMIN).</p>
      ) : (
        <DataTable
          columns={columns}
          rows={projects}
          keyField={(p) => p.id}
          loading={isLoading}
          empty="لا توجد مشاريع مطابقة."
        />
      )}

      <Modal isOpen={rejectId !== null} onClose={() => setRejectId(null)} title="سبب الرفض (اختياري)">
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
          className="mb-4 w-full rounded-lg border border-border bg-gray-light p-3 text-sm text-text outline-none focus:border-accent"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRejectId(null)}>
            إلغاء
          </Button>
          <Button
            variant="danger"
            disabled={rejectMutation.isPending}
            onClick={() => rejectId !== null && rejectMutation.mutate({ id: rejectId, reason: rejectReason })}
          >
            {rejectMutation.isPending ? '...جارٍ' : 'تأكيد الرفض'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsReviewPage;
