import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { useCreatePlan, useDeletePlan, usePlans, useUpdatePlan } from '../useSubscriptions';
import type { AdminPlan, PlanPatch } from '../subscriptionService';

const TIERS = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'];

const emptyForm: PlanPatch = {
  tier: 'BASIC',
  name: '',
  description: '',
  price: '0',
  currency: 'JOD',
  max_active_jobs: 1,
  max_visible_applicants: 5,
  can_view_applicant_contact: false,
  allows_featured_jobs: false,
  duration_days: 30,
  is_active: true,
  sort_order: 0,
};

function errorMessage(e: unknown, fallback = 'تعذّر الحفظ.'): string {
  const detail = (e as { response?: { data?: unknown } })?.response?.data;
  if (typeof detail === 'string') return detail;
  if (detail && typeof detail === 'object') {
    const obj = detail as Record<string, unknown>;
    const first = obj.detail ?? Object.values(obj)[0];
    if (Array.isArray(first)) return first.map(String).join(' ');
    if (typeof first === 'string') return first;
  }
  return fallback;
}

const PlansTab = () => {
  const { data: plans, isLoading, isError } = usePlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [editing, setEditing] = useState<AdminPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<PlanPatch>(emptyForm);
  const [toDelete, setToDelete] = useState<AdminPlan | null>(null);

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
  };
  const openEdit = (p: AdminPlan) => {
    const { id: _id, ...rest } = p;
    void _id;
    setForm(rest);
    setEditing(p);
    setCreating(false);
  };
  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async () => {
    if (editing) await updatePlan.mutateAsync({ id: editing.id, patch: form });
    else await createPlan.mutateAsync(form);
    closeForm();
  };

  const num = (k: keyof PlanPatch) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: Number(e.target.value) }));
  const str = (k: keyof PlanPatch) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const bool = (k: keyof PlanPatch) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.checked }));

  const columns: Column<AdminPlan>[] = [
    { key: 'name', header: 'الباقة', render: (p) => <span className="font-medium text-text">{p.name}</span> },
    { key: 'tier', header: 'المستوى', render: (p) => <Badge variant="info">{p.tier}</Badge> },
    { key: 'price', header: 'السعر', render: (p) => <span className="text-text-secondary">{Number(p.price) === 0 ? 'مجاني' : `${Number(p.price)} ${p.currency}`}</span> },
    { key: 'jobs', header: 'حد الوظائف', render: (p) => <span className="text-text-secondary">{p.max_active_jobs}</span> },
    { key: 'featured', header: 'إعلانات مميّزة', render: (p) => (p.allows_featured_jobs ? <Badge variant="success">نعم</Badge> : <Badge variant="default">لا</Badge>) },
    { key: 'active', header: 'مفعّلة', render: (p) => (p.is_active ? <Badge variant="success">نعم</Badge> : <Badge variant="danger">لا</Badge>) },
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
        <Button size="sm" onClick={openCreate}>إضافة باقة</Button>
      </div>

      {isError ? (
        <p className="text-red-400">تعذّر تحميل الباقات.</p>
      ) : (
        <DataTable columns={columns} rows={plans ?? []} keyField={(p) => p.id} loading={isLoading} empty="لا توجد باقات." />
      )}

      <Modal isOpen={creating || editing !== null} onClose={closeForm} title={editing ? 'تعديل باقة' : 'إضافة باقة'}>
        <div dir="rtl" className="space-y-3">
          {!editing && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">المستوى</label>
              <select
                value={form.tier ?? 'BASIC'}
                onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
                className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
              >
                {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
          <Input label="الاسم" value={form.name ?? ''} onChange={str('name')} />
          <Input label="الوصف" value={form.description ?? ''} onChange={str('description')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="السعر" type="number" value={String(form.price ?? '0')} onChange={str('price')} />
            <Input label="العملة" value={form.currency ?? 'JOD'} onChange={str('currency')} />
            <Input label="حد الوظائف النشطة" type="number" value={String(form.max_active_jobs ?? 0)} onChange={num('max_active_jobs')} />
            <Input label="حد المتقدمين الظاهرين" type="number" value={String(form.max_visible_applicants ?? 0)} onChange={num('max_visible_applicants')} />
            <Input label="مدة الاشتراك (يوم)" type="number" value={String(form.duration_days ?? 30)} onChange={num('duration_days')} />
            <Input label="ترتيب العرض" type="number" value={String(form.sort_order ?? 0)} onChange={num('sort_order')} />
          </div>
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" checked={!!form.can_view_applicant_contact} onChange={bool('can_view_applicant_contact')} />
            إظهار بيانات تواصل المتقدمين
          </label>
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" checked={!!form.allows_featured_jobs} onChange={bool('allows_featured_jobs')} />
            يسمح بالإعلانات المميّزة
          </label>
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" checked={!!form.is_active} onChange={bool('is_active')} />
            مفعّلة
          </label>
          {(createPlan.isError || updatePlan.isError) && (
            <p className="text-sm text-red-400">{errorMessage(createPlan.error || updatePlan.error)}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeForm}>إلغاء</Button>
            <Button disabled={createPlan.isPending || updatePlan.isPending || !form.name} onClick={save}>
              {createPlan.isPending || updatePlan.isPending ? '...جارٍ' : 'حفظ'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)} title="حذف باقة">
        <p className="mb-4 text-text-secondary">حذف باقة «{toDelete?.name}»؟ يُرفض الحذف إن كانت مرتبطة باشتراكات.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToDelete(null)}>إلغاء</Button>
          <Button
            variant="danger"
            disabled={deletePlan.isPending}
            onClick={async () => {
              if (!toDelete) return;
              await deletePlan.mutateAsync(toDelete.id);
              setToDelete(null);
            }}
          >
            {deletePlan.isPending ? '...جارٍ' : 'حذف'}
          </Button>
        </div>
        {deletePlan.isError && <p className="mt-2 text-sm text-red-400">{errorMessage(deletePlan.error, 'تعذّر الحذف.')}</p>}
      </Modal>
    </div>
  );
};

export default PlansTab;
