import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/ui/Pagination';
import { useApproveCompany, useCompanies, useRejectCompany, useVerifyCompany } from '../useCompanies';
import type { AdminCompany, CompanyFilters } from '../companyService';
import { CompanyDetailDrawer } from '../components/CompanyDetailDrawer';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'قيد المراجعة',
  APPROVED: 'معتمدة',
  REJECTED: 'مرفوضة',
};

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

const CompaniesPage = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<CompanyFilters>({ page: 1 });
  const [toReject, setToReject] = useState<AdminCompany | null>(null);
  const [note, setNote] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const { data, isLoading, isError } = useCompanies(filters);
  const verify = useVerifyCompany();
  const approve = useApproveCompany();
  const reject = useRejectCompany();

  const apply = (patch: CompanyFilters) => setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  const setPage = (page: number) => setFilters((prev) => ({ ...prev, page }));

  const confirmReject = async () => {
    if (!toReject) return;
    await reject.mutateAsync({ slug: toReject.slug, note });
    setToReject(null);
    setNote('');
  };

  const columns: Column<AdminCompany>[] = [
    {
      key: 'name',
      header: 'الشركة',
      render: (c) => (
        <div>
          <p className="font-medium text-text">{c.name}</p>
          {c.tagline && <p className="text-xs text-text-secondary">{c.tagline}</p>}
        </div>
      ),
    },
    { key: 'industry', header: 'المجال', render: (c) => <span className="text-text-secondary">{c.industry || '—'}</span> },
    {
      key: 'status',
      header: 'الحالة',
      render: (c) => (
        <Badge variant={STATUS_VARIANT[c.status] ?? 'default'}>{STATUS_LABEL[c.status] ?? c.status}</Badge>
      ),
    },
    {
      key: 'verified',
      header: 'التوثيق',
      render: (c) =>
        c.is_verified ? <Badge variant="success">موثّقة</Badge> : <Badge variant="default">—</Badge>,
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (c) => (
        <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {c.status !== 'APPROVED' && (
            <button
              type="button"
              onClick={() => approve.mutate({ slug: c.slug })}
              disabled={approve.isPending}
              className="rounded border border-accent/40 px-2 py-1 text-xs text-accent hover:bg-accent/10 disabled:opacity-50"
            >
              اعتماد
            </button>
          )}
          {c.status !== 'REJECTED' && (
            <button
              type="button"
              onClick={() => setToReject(c)}
              className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
            >
              رفض
            </button>
          )}
          <button
            type="button"
            onClick={() => verify.mutate({ slug: c.slug, isVerified: !c.is_verified })}
            className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent"
          >
            {c.is_verified ? 'إلغاء التوثيق' : 'توثيق'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">إدارة الشركات</h1>
          <p className="mt-1 text-sm text-text-secondary">راجِع طلبات إنشاء الشركات واعتمدها، ووثّق الشركات.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              apply({ q: search.trim() || undefined });
            }}
            className="flex gap-2"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن شركة..."
              className="rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
            <Button type="submit" variant="secondary" size="sm">
              بحث
            </Button>
          </form>
          <Select
            value={filters.status ?? ''}
            onChange={(e) => apply({ status: e.target.value || undefined })}
            options={[
              { value: '', label: 'كل الحالات' },
              { value: 'PENDING', label: 'قيد المراجعة' },
              { value: 'APPROVED', label: 'معتمدة' },
              { value: 'REJECTED', label: 'مرفوضة' },
            ]}
          />
        </div>
      </div>

      {isError ? (
        <p className="text-red-400">تعذّر تحميل الشركات.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data?.results ?? []}
            keyField={(c) => c.id}
            onRowClick={(c) => setSelectedSlug(c.slug)}
            loading={isLoading}
            empty="لا توجد شركات مطابقة."
          />
          {data && (
            <Pagination
              page={filters.page ?? 1}
              hasMore={Boolean(data.next)}
              total={data.count}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <Modal isOpen={!!toReject} onClose={() => setToReject(null)} title="رفض طلب الشركة">
        <p className="mb-3 text-text-secondary">
          رفض شركة <span className="text-text">{toReject?.name}</span>.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="سبب الرفض (اختياري)"
          className="mb-4 w-full rounded-lg border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToReject(null)}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={confirmReject} disabled={reject.isPending}>
            {reject.isPending ? '...جارٍ' : 'تأكيد الرفض'}
          </Button>
        </div>
      </Modal>

      <CompanyDetailDrawer slug={selectedSlug} onClose={() => setSelectedSlug(null)} />
    </div>
  );
};

export default CompaniesPage;
