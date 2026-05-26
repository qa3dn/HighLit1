import { useState } from 'react';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useApplicants, useDeleteJob, useJobs, useSetJobFeatured } from '../useJobs';
import type { AdminJob } from '../jobService';

const TYPE_LABEL: Record<string, string> = {
  PAID: 'مدفوعة',
  INTERNSHIP: 'تدريب',
  FREELANCE: 'عمل حر',
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'مسودة',
  PUBLISHED: 'منشورة',
  CLOSED: 'مغلقة',
};

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PUBLISHED: 'success',
  DRAFT: 'default',
  CLOSED: 'danger',
};

const APP_STATUS_LABEL: Record<string, string> = {
  PENDING: 'قيد المراجعة',
  REVIEWED: 'تمت المراجعة',
  SHORTLISTED: 'القائمة المختصرة',
  REJECTED: 'مرفوض',
  ACCEPTED: 'مقبول',
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function ApplicantsModal({ job, onClose }: { job: AdminJob; onClose: () => void }) {
  const { data, isLoading } = useApplicants(job.id);
  return (
    <Modal isOpen onClose={onClose} title={`متقدمو: ${job.title}`}>
      {isLoading ? (
        <Loader />
      ) : !data || data.total === 0 ? (
        <p className="py-8 text-center text-text-secondary">لا يوجد متقدمون.</p>
      ) : (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          <p className="text-xs text-text-secondary">{data.total} متقدم — العرض الكامل للأدمن</p>
          {data.results.map((app) => (
            <div key={app.id} className="rounded-lg border border-border bg-gray p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text">@{app.applicant.username}</span>
                <Badge variant="default">{APP_STATUS_LABEL[app.status] ?? app.status}</Badge>
              </div>
              {app.cover_letter && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{app.cover_letter}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary" dir="ltr">
                {app.applicant.email && <span>{app.applicant.email}</span>}
                {app.applicant.github_username && <span>GitHub: {app.applicant.github_username}</span>}
                {app.resume_url && (
                  <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    السيرة الذاتية
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

const JobsPage = () => {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [applicantsJob, setApplicantsJob] = useState<AdminJob | null>(null);
  const [toDelete, setToDelete] = useState<AdminJob | null>(null);

  const { data, isLoading, isError } = useJobs({
    q: query,
    status: statusFilter,
    type: typeFilter,
    featured: featuredFilter,
  });
  const setFeatured = useSetJobFeatured();
  const deleteJob = useDeleteJob();

  const confirmDelete = async () => {
    if (!toDelete) return;
    await deleteJob.mutateAsync(toDelete.id);
    setToDelete(null);
  };

  const jobs = data?.results ?? [];
  const selectClass =
    'rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent';

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">إدارة الوظائف</h1>
        <p className="mt-1 text-sm text-text-secondary">
          كل الوظائف عبر المنصّة — تمييز الإعلانات المدفوعة، مراجعة المتقدمين، والحذف.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
          }}
          className="flex gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالعنوان أو الشركة..."
            className="w-56 rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
          <Button type="submit" variant="secondary" size="sm">
            بحث
          </Button>
        </form>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option value="">كل الحالات</option>
          <option value="PUBLISHED">منشورة</option>
          <option value="DRAFT">مسودة</option>
          <option value="CLOSED">مغلقة</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClass}>
          <option value="">كل الأنواع</option>
          <option value="PAID">مدفوعة</option>
          <option value="INTERNSHIP">تدريب</option>
          <option value="FREELANCE">عمل حر</option>
        </select>
        <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)} className={selectClass}>
          <option value="">الكل</option>
          <option value="true">مميّزة</option>
          <option value="false">غير مميّزة</option>
        </select>
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <p className="text-red-400">تعذّر تحميل الوظائف.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-gray-light">
          <table className="w-full min-w-[840px] text-right text-sm">
            <thead className="border-b border-border bg-gray text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">الوظيفة</th>
                <th className="px-4 py-3">الشركة</th>
                <th className="px-4 py-3">النوع</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">المتقدمون</th>
                <th className="px-4 py-3">مميّزة</th>
                <th className="px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray transition-colors">
                  <td className="px-4 py-3 font-medium text-text">{job.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{job.company_detail?.name ?? job.company}</td>
                  <td className="px-4 py-3 text-text-secondary">{TYPE_LABEL[job.job_type] ?? job.job_type}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[job.status] ?? 'default'}>
                      {STATUS_LABEL[job.status] ?? job.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setApplicantsJob(job)}
                      className="rounded border border-border px-2 py-1 text-xs text-text hover:border-accent hover:text-accent"
                    >
                      {job.application_count} متقدم
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setFeatured.mutate({ id: job.id, isFeatured: !job.is_featured })}
                      disabled={setFeatured.isPending}
                      className={`rounded border px-2 py-1 text-xs disabled:opacity-50 ${
                        job.is_featured
                          ? 'border-accent/50 bg-accent/10 text-accent'
                          : 'border-border text-text-secondary hover:border-accent hover:text-accent'
                      }`}
                    >
                      {job.is_featured ? 'مميّزة ★' : 'تمييز'}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-text-secondary">
                    {formatDate(job.created_at)}
                    <button
                      type="button"
                      onClick={() => setToDelete(job)}
                      className="mr-2 rounded border border-red-500/40 px-2 py-1 text-red-400 hover:bg-red-500/10"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                    لا توجد وظائف مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {applicantsJob && <ApplicantsModal job={applicantsJob} onClose={() => setApplicantsJob(null)} />}

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)} title="تأكيد الحذف">
        <p className="mb-6 text-text-secondary">
          سيتم حذف الوظيفة <span className="text-text">{toDelete?.title}</span> نهائياً.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToDelete(null)}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleteJob.isPending}>
            {deleteJob.isPending ? '...جارٍ' : 'حذف نهائي'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default JobsPage;
