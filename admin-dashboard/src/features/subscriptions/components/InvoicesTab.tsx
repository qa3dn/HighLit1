import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Select';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/ui/Pagination';
import { useInvoices, usePayInvoice, useVoidInvoice } from '../useSubscriptions';
import type { Invoice } from '../subscriptionService';

const STATUS_LABEL: Record<string, string> = { OPEN: 'مفتوحة', PAID: 'مدفوعة', VOID: 'ملغاة' };
const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  OPEN: 'warning',
  PAID: 'success',
  VOID: 'default',
};
const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'OPEN', label: 'مفتوحة' },
  { value: 'PAID', label: 'مدفوعة' },
  { value: 'VOID', label: 'ملغاة' },
];

const fmtDate = (iso: string) => new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));

const InvoicesTab = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useInvoices(status, page);
  const pay = usePayInvoice();
  const voidInv = useVoidInvoice();

  const columns: Column<Invoice>[] = [
    { key: 'company', header: 'الشركة', render: (i) => <span className="font-medium text-text">{i.company_name}</span> },
    { key: 'desc', header: 'الوصف', render: (i) => <span className="text-text-secondary">{i.description || '—'}</span> },
    {
      key: 'total',
      header: 'المبلغ',
      render: (i) => (
        <span className="whitespace-nowrap text-text">
          {Number(i.total)} {i.currency}
          {Number(i.discount_amount) > 0 && (
            <span className="mr-1 text-xs text-text-secondary line-through">{Number(i.amount)}</span>
          )}
        </span>
      ),
    },
    {
      key: 'promo',
      header: 'كود الخصم',
      render: (i) => (i.promo_code_label ? <span className="font-mono text-xs text-accent">{i.promo_code_label}</span> : <span className="text-text-secondary">—</span>),
    },
    {
      key: 'proof',
      header: 'إثبات التحويل',
      render: (i) =>
        i.transfer_reference || i.proof_url ? (
          <div className="flex flex-col gap-0.5 text-xs">
            {i.transfer_reference && <span className="font-mono text-text-secondary">{i.transfer_reference}</span>}
            {i.proof_url && (
              <a href={i.proof_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                عرض الإيصال
              </a>
            )}
          </div>
        ) : (
          <span className="text-text-secondary">—</span>
        ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (i) => <Badge variant={STATUS_VARIANT[i.status] ?? 'default'}>{STATUS_LABEL[i.status] ?? i.status}</Badge>,
    },
    { key: 'date', header: 'التاريخ', render: (i) => <span className="whitespace-nowrap text-text-secondary">{fmtDate(i.created_at)}</span> },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (i) =>
        i.status === 'OPEN' ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => pay.mutate(i.id)}
              disabled={pay.isPending}
              className="rounded border border-accent/40 px-2 py-1 text-xs text-accent hover:bg-accent/10 disabled:opacity-50"
            >
              تسجيل دفعة
            </button>
            <button
              type="button"
              onClick={() => voidInv.mutate(i.id)}
              disabled={voidInv.isPending}
              className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              إبطال
            </button>
          </div>
        ) : i.status === 'PAID' ? (
          <span className="text-xs text-text-secondary">{i.payments[0]?.gateway ?? '—'}</span>
        ) : (
          <span className="text-xs text-text-secondary">—</span>
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
        <p className="text-red-400">تعذّر تحميل الفواتير.</p>
      ) : (
        <>
          <DataTable columns={columns} rows={data?.results ?? []} keyField={(i) => i.id} loading={isLoading} empty="لا توجد فواتير." />
          {data && <Pagination page={page} hasMore={data.hasMore} total={data.count} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};

export default InvoicesTab;
