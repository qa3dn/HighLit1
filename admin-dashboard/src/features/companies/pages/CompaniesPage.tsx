import { useState } from 'react';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import {
  useApproveCompany,
  useCompanies,
  useRejectCompany,
  useVerifyCompany,
} from '../useCompanies';
import type { AdminCompany, CompanyFilters } from '../companyService';

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
  const [filters, setFilters] = useState<CompanyFilters>({});
  const [toReject, setToReject] = useState<AdminCompany | null>(null);
  const [note, setNote] = useState('');

  const { data, isLoading, isError } = useCompanies(filters);
  const verify = useVerifyCompany();
  const approve = useApproveCompany();
  const reject = useRejectCompany();

  const apply = (patch: CompanyFilters) => setFilters((prev) => ({ ...prev, ...patch, page: 1 }));

  const confirmReject = async () => {
    if (!toReject) return;
    await reject.mutateAsync({ slug: toReject.slug, note });
    setToReject(null);
    setNote('');
  };

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">إدارة الشركات</h1>
          <p className="mt-1 text-sm text-text-secondary">راجِع طلبات إنشاء الشركات واعتمدها، ووثّق الشركات.</p>
        </div>
        <div className="flex flex-wrap gap-2">
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
          <select
            value={filters.status ?? ''}
            onChange={(e) => apply({ status: e.target.value || undefined })}
            className="rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent"
          >
            <option value="">كل الحالات</option>
            <option value="PENDING">قيد المراجعة</option>
            <option value="APPROVED">معتمدة</option>
            <option value="REJECTED">مرفوضة</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <p className="text-red-400">تعذّر تحميل الشركات.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-gray-light">
          <table className="w-full min-w-[820px] text-right text-sm">
            <thead className="border-b border-border bg-gray text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">الشركة</th>
                <th className="px-4 py-3">المجال</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">التوثيق</th>
                <th className="px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data?.results ?? []).map((company) => (
                <tr key={company.id} className="hover:bg-gray transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">{company.name}</p>
                    {company.tagline && <p className="text-xs text-text-secondary">{company.tagline}</p>}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{company.industry || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[company.status] ?? 'default'}>
                      {STATUS_LABEL[company.status] ?? company.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {company.is_verified ? <Badge variant="success">موثّقة</Badge> : <Badge variant="default">—</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {company.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => approve.mutate({ slug: company.slug })}
                          disabled={approve.isPending}
                          className="rounded border border-accent/40 px-2 py-1 text-xs text-accent hover:bg-accent/10 disabled:opacity-50"
                        >
                          اعتماد
                        </button>
                      )}
                      {company.status !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => setToReject(company)}
                          className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          رفض
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => verify.mutate({ slug: company.slug, isVerified: !company.is_verified })}
                        className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent"
                      >
                        {company.is_verified ? 'إلغاء التوثيق' : 'توثيق'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(data?.results ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                    لا توجد شركات مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && data.count > data.results.length && (
        <p className="text-center text-xs text-text-secondary">
          عرض {data.results.length} من {data.count}
        </p>
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
    </div>
  );
};

export default CompaniesPage;
