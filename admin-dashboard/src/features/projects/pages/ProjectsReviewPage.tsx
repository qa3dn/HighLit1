import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  hideProject,
  listProjects,
  rejectProject,
  type ProjectFilters,
} from '../../../services/studentProjects';

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

  const hideMutation = useMutation({
    mutationFn: (id: number) => hideProject(id),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectProject(id, reason),
    onSuccess: () => {
      setRejectId(null);
      setRejectReason('');
      invalidate();
    },
  });

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text">مراجعة مشاريع الطلاب</h1>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="بحث..."
          value={filters.q || ''}
          onChange={(e) => setFilters({ ...filters, q: e.target.value || undefined })}
          className="rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text"
        />
        <select
          value={filters.university || ''}
          onChange={(e) => setFilters({ ...filters, university: e.target.value || undefined })}
          className="rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text"
        >
          <option value="">كل الجامعات</option>
          {[...new Set(projects.map((p) => p.university))].map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select
          value={filters.major || ''}
          onChange={(e) => setFilters({ ...filters, major: e.target.value || undefined })}
          className="rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text"
        >
          <option value="">كل التخصصات</option>
          {[...new Set(projects.map((p) => p.major))].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={filters.status || ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: (e.target.value as ProjectFilters['status']) || undefined,
            })
          }
          className="rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text"
        >
          <option value="">كل الحالات</option>
          <option value="PUBLISHED">منشور</option>
          <option value="HIDDEN">مخفي</option>
          <option value="REJECTED">مرفوض</option>
        </select>
      </div>

      {isLoading && <p className="text-text-secondary">جاري التحميل...</p>}
      {isError && (
        <p className="text-red-400">تعذّر تحميل المشاريع. تأكد من تسجيل الدخول كمسؤول (ADMIN).</p>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-gray-light text-text-secondary">
              <tr>
                <th className="p-3 text-right">المشروع</th>
                <th className="p-3 text-right">الطالب</th>
                <th className="p-3 text-right">الجامعة</th>
                <th className="p-3 text-right">التخصص</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3 font-medium text-text">{p.title}</td>
                  <td className="p-3 text-text-secondary">{p.author?.username}</td>
                  <td className="p-3 text-text-secondary">{p.university}</td>
                  <td className="p-3 text-text-secondary">{p.major}</td>
                  <td className="p-3">
                    <span className="text-accent">{p.status}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {p.status === 'PUBLISHED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => hideMutation.mutate(p.id)}
                            className="rounded border border-border px-2 py-1 text-xs hover:border-accent"
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
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-gray p-6">
            <h3 className="mb-3 font-semibold text-text">سبب الرفض (اختياري)</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="mb-4 w-full rounded-lg border border-border bg-gray-light p-3 text-text"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectId(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })}
                disabled={rejectMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsReviewPage;
