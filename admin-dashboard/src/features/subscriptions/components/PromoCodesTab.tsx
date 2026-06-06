import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import {
  useCreatePromoCode,
  useDeletePromoCode,
  usePlans,
  usePromoCodes,
  useUpdatePromoCode,
} from '../useSubscriptions';
import type { PromoCode, PromoPatch } from '../subscriptionService';

interface FormState {
  code: string;
  discount_type: 'PERCENT' | 'FIXED';
  amount: string;
  plan: string;
  valid_from: string;
  valid_until: string;
  max_uses: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  code: '',
  discount_type: 'PERCENT',
  amount: '10',
  plan: '',
  valid_from: '',
  valid_until: '',
  max_uses: '',
  is_active: true,
};

const toLocalInput = (iso: string | null) => (iso ? iso.slice(0, 16) : '');

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

const fmtDate = (iso: string | null) => (iso ? new Intl.DateTimeFormat('ar', { dateStyle: 'short' }).format(new Date(iso)) : '∞');

const PromoCodesTab = () => {
  const { data: promos, isLoading, isError } = usePromoCodes();
  const { data: plans } = usePlans();
  const createPromo = useCreatePromoCode();
  const updatePromo = useUpdatePromoCode();
  const deletePromo = useDeletePromoCode();

  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toDelete, setToDelete] = useState<PromoCode | null>(null);

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
  };
  const openEdit = (p: PromoCode) => {
    setForm({
      code: p.code,
      discount_type: p.discount_type,
      amount: p.amount,
      plan: p.plan != null ? String(p.plan) : '',
      valid_from: toLocalInput(p.valid_from),
      valid_until: toLocalInput(p.valid_until),
      max_uses: p.max_uses != null ? String(p.max_uses) : '',
      is_active: p.is_active,
    });
    setEditing(p);
    setCreating(false);
  };
  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async () => {
    const payload: PromoPatch = {
      code: form.code.trim(),
      discount_type: form.discount_type,
      amount: form.amount,
      plan: form.plan ? Number(form.plan) : null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_active: form.is_active,
    };
    if (editing) await updatePromo.mutateAsync({ id: editing.id, patch: payload });
    else await createPromo.mutateAsync(payload);
    closeForm();
  };

  const columns: Column<PromoCode>[] = [
    { key: 'code', header: 'الكود', render: (p) => <span className="font-mono font-medium text-text">{p.code}</span> },
    {
      key: 'discount',
      header: 'الخصم',
      render: (p) => <span className="text-text-secondary">{p.discount_type === 'PERCENT' ? `${Number(p.amount)}%` : `${Number(p.amount)} JOD`}</span>,
    },
    { key: 'plan', header: 'الباقة', render: (p) => <span className="text-text-secondary">{p.plan_name ?? 'كل الباقات'}</span> },
    { key: 'usage', header: 'الاستخدام', render: (p) => <span className="text-text-secondary">{p.used_count}{p.max_uses != null ? ` / ${p.max_uses}` : ''}</span> },
    { key: 'until', header: 'ينتهي', render: (p) => <span className="text-text-secondary">{fmtDate(p.valid_until)}</span> },
    {
      key: 'state',
      header: 'الحالة',
      render: (p) => (p.is_redeemable ? <Badge variant="success">صالح</Badge> : <Badge variant="default">غير صالح</Badge>),
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (p) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => openEdit(p)} className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent">تعديل</button>
          <button type="button" onClick={() => setToDelete(p)} className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10">حذف</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>إضافة كود خصم</Button>
      </div>

      {isError ? (
        <p className="text-red-400">تعذّر تحميل أكواد الخصم.</p>
      ) : (
        <DataTable columns={columns} rows={promos ?? []} keyField={(p) => p.id} loading={isLoading} empty="لا توجد أكواد خصم." />
      )}

      <Modal isOpen={creating || editing !== null} onClose={closeForm} title={editing ? 'تعديل كود خصم' : 'إضافة كود خصم'}>
        <div dir="rtl" className="space-y-3">
          <Input label="الكود" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">نوع الخصم</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'PERCENT' | 'FIXED' }))}
                className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
              >
                <option value="PERCENT">نسبة %</option>
                <option value="FIXED">مبلغ ثابت (JOD)</option>
              </select>
            </div>
            <Input label="القيمة" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">مقيّد بباقة (اختياري)</label>
            <select
              value={form.plan}
              onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
              className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
            >
              <option value="">كل الباقات</option>
              {(plans ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">يبدأ</label>
              <input type="datetime-local" value={form.valid_from} onChange={(e) => setForm((f) => ({ ...f, valid_from: e.target.value }))} className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">ينتهي</label>
              <input type="datetime-local" value={form.valid_until} onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))} className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent" />
            </div>
          </div>
          <Input label="حد الاستخدام (فارغ = غير محدود)" type="number" value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            مفعّل
          </label>
          {(createPromo.isError || updatePromo.isError) && (
            <p className="text-sm text-red-400">{errorMessage(createPromo.error || updatePromo.error)}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeForm}>إلغاء</Button>
            <Button disabled={createPromo.isPending || updatePromo.isPending || !form.code.trim()} onClick={save}>
              {createPromo.isPending || updatePromo.isPending ? '...جارٍ' : 'حفظ'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)} title="حذف كود خصم">
        <p className="mb-4 text-text-secondary">حذف الكود «{toDelete?.code}»؟</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToDelete(null)}>إلغاء</Button>
          <Button
            variant="danger"
            disabled={deletePromo.isPending}
            onClick={async () => {
              if (!toDelete) return;
              await deletePromo.mutateAsync(toDelete.id);
              setToDelete(null);
            }}
          >
            {deletePromo.isPending ? '...جارٍ' : 'حذف'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PromoCodesTab;
