import { useState } from 'react';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { DataTable, type Column } from '../../../components/ui/DataTable';
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

  const columns: Column<AdminJob>[] = [
    { key: 'title', header: 'الوظيفة', render: (j) => <span className="font-medium text-text">{j.title}</span> },
    { key: 'company', header: 'الشركة', render: (j) => <span className="text-text-secondary">{j.company_detail?.name ?? j.company}</span> },
    { key: 'type', header: 'النوع', render: (j) => <span className="text-text-secondary">{TYPE_LABEL[j.job_type] ?? j.job_type}</span> },
    {
      key: 'status',
      header: 'الحالة',
      render: (j) => (
        <Badge variant={STATUS_VARIANT[j.status] ?? 'default'}>{STATUS_LABEL[j.status] ?? j.status}</Badge>
      ),
    },
    {
      key: 'applicants',
      header: 'المتقدمون',
      render: (j) => (
        <button
          type="button"
          onClick={() => setApplicantsJob(j)}
          className="rounded border border-border px-2 py-1 text-xs text-text hover:border-accent hover:text-accent"
        >
          {j.application_count} متقدم
        </button>
      ),
    },
    {
      key: 'featured',
      header: 'مميّزة',
      render: (j) => (
        <button
          type="button"
          onClick={() => setFeatured.mutate({ id: j.id, isFeatured: !j.is_featured })}
          disabled={setFeatured.isPending}
          className={`rounded border px-2 py-1 text-xs disabled:opacity-50 ${
            j.is_featured
              ? 'border-accent/50 bg-accent/10 text-accent'
              : 'border-border text-text-secondary hover:border-accent hover:text-accent'
          }`}
        >
          {j.is_featured ? 'مميّزة ★' : 'تمييز'}
        </button>
      ),
    },
    { key: 'date', header: 'التاريخ', render: (j) => <span className="whitespace-nowrap text-xs text-text-secondary">{formatDate(j.created_at)}</span> },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (j) => (
        <button
          type="button"
          onClick={() => setToDelete(j)}
          className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
        >
          حذف
        </button>
      ),
    },
  ];

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">إدارة الوظائف</h1>
        <p className="mt-1 text-sm text-text-secondary">
          كل الوظائف عبر المنصّة — تمييز الإعلانات المدفوعة، مراجعة المتقدمين، والحذف.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
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
            className="w-full min-w-[12rem] rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent sm:w-56"
          />
          <Button type="submit" variant="secondary" size="sm">
            بحث
          </Button>
        </form>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'كل الحالات' },
            { value: 'PUBLISHED', label: 'منشورة' },
            { value: 'DRAFT', label: 'مسودة' },
            { value: 'CLOSED', label: 'مغلقة' },
          ]}
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: '', label: 'كل الأنواع' },
            { value: 'PAID', label: 'مدفوعة' },
            { value: 'INTERNSHIP', label: 'تدريب' },
            { value: 'FREELANCE', label: 'عمل حر' },
          ]}
        />
        <Select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          options={[
            { value: '', label: 'الكل' },
            { value: 'true', label: 'مميّزة' },
            { value: 'false', label: 'غير مميّزة' },
          ]}
        />
      </div>

      {isError ? (
        <p className="text-red-400">تعذّر تحميل الوظائف.</p>
      ) : (
        <DataTable
          columns={columns}
          rows={data?.results ?? []}
          keyField={(j) => j.id}
          loading={isLoading}
          empty="لا توجد وظائف مطابقة."
        />
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
