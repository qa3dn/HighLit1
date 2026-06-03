import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/ui/Pagination';
import {
  useActivateCampaign,
  useCampaigns,
  useCreateCampaign,
  useDeleteCampaign,
  useEndCampaign,
} from '../useSubscriptions';
import type { Campaign, CampaignPayload } from '../subscriptionService';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'قيد المراجعة',
  ACTIVE: 'نشطة',
  EXPIRED: 'منتهية',
  REJECTED: 'مرفوضة',
  CANCELLED: 'ملغاة',
};
const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  EXPIRED: 'default',
  REJECTED: 'danger',
  CANCELLED: 'default',
};
const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'PENDING', label: 'قيد المراجعة' },
  { value: 'ACTIVE', label: 'نشطة' },
  { value: 'EXPIRED', label: 'منتهية' },
];

interface FormState {
  company: string;
  name: string;
  target_type: 'JOB' | 'COMPANY';
  job: string;
  price: string;
  starts_at: string;
  ends_at: string;
}
const emptyForm: FormState = { company: '', name: '', target_type: 'JOB', job: '', price: '0', starts_at: '', ends_at: '' };

const fmtDate = (iso: string) => new Intl.DateTimeFormat('ar-EG', { dateStyle: 'short' }).format(new Date(iso));

function errorMessage(e: unknown, fallback = 'تعذّر الحفظ.'): string {
  const detail = (e as { response?: { data?: unknown } })?.response?.data;
  if (typeof detail === 'string') return detail;
  if (detail && typeof detail === 'object') {
    const first = (detail as Record<string, unknown>).detail ?? Object.values(detail as object)[0];
    if (Array.isArray(first)) return first.map(String).join(' ');
    if (typeof first === 'string') return first;
  }
  return fallback;
}

const CampaignsTab = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toDelete, setToDelete] = useState<Campaign | null>(null);

  const { data, isLoading, isError } = useCampaigns(status, page);
  const create = useCreateCampaign();
  const activate = useActivateCampaign();
  const end = useEndCampaign();
  const del = useDeleteCampaign();

  const save = async () => {
    const payload: CampaignPayload = {
      company: Number(form.company),
      name: form.name.trim(),
      target_type: form.target_type,
      job: form.target_type === 'JOB' && form.job ? Number(form.job) : null,
      price: form.price,
      currency: 'JOD',
      starts_at: form.starts_at,
      ends_at: form.ends_at,
    };
    await create.mutateAsync(payload);
    setCreating(false);
    setForm(emptyForm);
  };

  const columns: Column<Campaign>[] = [
    { key: 'name', header: 'الحملة', render: (c) => <span className="font-medium text-text">{c.name}</span> },
    { key: 'company', header: 'الشركة', render: (c) => <span className="text-text-secondary">{c.company_name}</span> },
    {
      key: 'target',
      header: 'الهدف',
      render: (c) => <span className="text-text-secondary">{c.target_type === 'JOB' ? c.job_title || `وظيفة #${c.job ?? '—'}` : 'الشركة'}</span>,
    },
    { key: 'price', header: 'السعر', render: (c) => <span className="text-text-secondary">{Number(c.price)} {c.currency}</span> },
    { key: 'status', header: 'الحالة', render: (c) => <Badge variant={STATUS_VARIANT[c.status] ?? 'default'}>{STATUS_LABEL[c.status] ?? c.status}</Badge> },
    { key: 'window', header: 'الفترة', render: (c) => <span className="whitespace-nowrap text-xs text-text-secondary">{fmtDate(c.starts_at)} – {fmtDate(c.ends_at)}</span> },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (c) => (
        <div className="flex flex-wrap gap-2">
          {c.status === 'PENDING' && (
            <button type="button" onClick={() => activate.mutate(c.id)} disabled={activate.isPending} className="rounded border border-accent/40 px-2 py-1 text-xs text-accent hover:bg-accent/10 disabled:opacity-50">تفعيل</button>
          )}
          {c.status === 'ACTIVE' && (
            <button type="button" onClick={() => end.mutate(c.id)} disabled={end.isPending} className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50">إنهاء</button>
          )}
          <button type="button" onClick={() => setToDelete(c)} className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10">حذف</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} options={STATUS_OPTIONS} />
        <Button size="sm" onClick={() => { setForm(emptyForm); setCreating(true); }}>إنشاء حملة</Button>
      </div>

      {isError ? (
        <p className="text-red-400">تعذّر تحميل الحملات.</p>
      ) : (
        <>
          <DataTable columns={columns} rows={data?.results ?? []} keyField={(c) => c.id} loading={isLoading} empty="لا توجد حملات." />
          {data && <Pagination page={page} hasMore={data.hasMore} total={data.count} onPageChange={setPage} />}
        </>
      )}

      <Modal isOpen={creating} onClose={() => setCreating(false)} title="إنشاء حملة ترويجية">
        <div dir="rtl" className="space-y-3">
          <Input label="معرّف الشركة (ID)" type="number" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
          <Input label="اسم الحملة" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">الهدف</label>
            <select value={form.target_type} onChange={(e) => setForm((f) => ({ ...f, target_type: e.target.value as 'JOB' | 'COMPANY' }))} className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent">
              <option value="JOB">وظيفة</option>
              <option value="COMPANY">الشركة</option>
            </select>
          </div>
          {form.target_type === 'JOB' && (
            <Input label="معرّف الوظيفة (ID)" type="number" value={form.job} onChange={(e) => setForm((f) => ({ ...f, job: e.target.value }))} />
          )}
          <Input label="السعر (JOD)" type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">يبدأ</label>
              <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">ينتهي</label>
              <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))} className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent" />
            </div>
          </div>
          {create.isError && <p className="text-sm text-red-400">{errorMessage(create.error)}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCreating(false)}>إلغاء</Button>
            <Button disabled={create.isPending || !form.company || !form.name.trim() || !form.starts_at || !form.ends_at} onClick={save}>
              {create.isPending ? '...جارٍ' : 'إنشاء'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)} title="حذف حملة">
        <p className="mb-4 text-text-secondary">حذف الحملة «{toDelete?.name}»؟ سيُلغى تمييز الوظيفة إن كانت نشطة.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToDelete(null)}>إلغاء</Button>
          <Button variant="danger" disabled={del.isPending} onClick={async () => { if (!toDelete) return; await del.mutateAsync(toDelete.id); setToDelete(null); }}>
            {del.isPending ? '...جارٍ' : 'حذف'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CampaignsTab;
