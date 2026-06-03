import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/ui/Pagination';
import { useActivateSubscription, useRejectSubscription, useSubscriptions } from '../useSubscriptions';
import type { CompanySubscription } from '../subscriptionService';
import PlansTab from '../components/PlansTab';
import PromoCodesTab from '../components/PromoCodesTab';

type Tab = 'requests' | 'plans' | 'promos';
const TABS: TabItem<Tab>[] = [
  { key: 'requests', label: 'الطلبات' },
  { key: 'plans', label: 'الباقات' },
  { key: 'promos', label: 'أكواد الخصم' },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'قيد المراجعة',
  ACTIVE: 'مفعّل',
  REJECTED: 'مرفوض',
  EXPIRED: 'منتهٍ',
  CANCELLED: 'ملغى',
};

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  REJECTED: 'danger',
  EXPIRED: 'default',
  CANCELLED: 'default',
};

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'PENDING', label: 'قيد المراجعة' },
  { value: 'ACTIVE', label: 'مفعّل' },
  { value: 'REJECTED', label: 'مرفوض' },
  { value: 'EXPIRED', label: 'منتهٍ' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function priceLabel(sub: CompanySubscription) {
  return Number(sub.plan.price) === 0 ? 'مجاني' : `${Number(sub.plan.price)} ${sub.plan.currency}`;
}

const RequestsTab = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [toReject, setToReject] = useState<CompanySubscription | null>(null);
  const [note, setNote] = useState('');

  const { data, isLoading, isError } = useSubscriptions(status, page);
  const activate = useActivateSubscription();
  const reject = useRejectSubscription();

  const confirmReject = async () => {
    if (!toReject) return;
    await reject.mutateAsync({ id: toReject.id, note });
    setToReject(null);
    setNote('');
  };

  const columns: Column<CompanySubscription>[] = [
    { key: 'company', header: 'الشركة', render: (s) => <span className="font-medium text-text">{s.company_name}</span> },
    {
      key: 'plan',
      header: 'الباقة',
      render: (s) => (
        <span className="text-text-secondary">
          {s.plan.name} <span className="text-xs">({priceLabel(s)})</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (s) => <Badge variant={STATUS_VARIANT[s.status] ?? 'default'}>{STATUS_LABEL[s.status] ?? s.status}</Badge>,
    },
    { key: 'requested_by', header: 'مقدّم الطلب', render: (s) => <span className="text-text-secondary">{s.requested_by_username || '—'}</span> },
    { key: 'created_at', header: 'التاريخ', render: (s) => <span className="whitespace-nowrap text-text-secondary">{formatDate(s.created_at)}</span> },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (s) =>
        s.status === 'PENDING' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => activate.mutate({ id: s.id })}
              disabled={activate.isPending}
              className="rounded border border-accent/40 px-2 py-1 text-xs text-accent hover:bg-accent/10 disabled:opacity-50"
            >
              تفعيل
            </button>
            <button
              type="button"
              onClick={() => setToReject(s)}
              className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
            >
              رفض
            </button>
          </div>
        ) : (
          <span className="text-xs text-text-secondary">{s.note || '—'}</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
        />
      </div>

      {isError ? (
        <p className="text-red-400">تعذّر تحميل الطلبات.</p>
      ) : (
        <>
          <DataTable columns={columns} rows={data?.results ?? []} keyField={(s) => s.id} loading={isLoading} empty="لا توجد طلبات مطابقة." />
          {data && <Pagination page={page} hasMore={data.hasMore} total={data.count} onPageChange={setPage} />}
        </>
      )}

      <Modal isOpen={!!toReject} onClose={() => setToReject(null)} title="رفض طلب الاشتراك">
        <p className="mb-3 text-text-secondary">
          رفض طلب «{toReject?.company_name}» لباقة «{toReject?.plan.name}».
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

const SubscriptionsPage = () => {
  const [tab, setTab] = useState<Tab>('requests');
  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">الاشتراكات والباقات</h1>
        <p className="mt-1 text-sm text-text-secondary">طلبات الاشتراك، إدارة الباقات، وأكواد الخصم.</p>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'requests' && <RequestsTab />}
      {tab === 'plans' && <PlansTab />}
      {tab === 'promos' && <PromoCodesTab />}
    </div>
  );
};

export default SubscriptionsPage;
