import { useState } from 'react';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import {
  useActivateSubscription,
  useRejectSubscription,
  useSubscriptions,
} from '../useSubscriptions';
import type { CompanySubscription } from '../subscriptionService';

const STATUS_FILTERS = ['', 'PENDING', 'ACTIVE', 'REJECTED', 'EXPIRED'];

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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

const SubscriptionsPage = () => {
  const [status, setStatus] = useState('');
  const [toReject, setToReject] = useState<CompanySubscription | null>(null);
  const [note, setNote] = useState('');

  const { data: subs, isLoading, isError } = useSubscriptions(status);
  const activate = useActivateSubscription();
  const reject = useRejectSubscription();

  const confirmReject = async () => {
    if (!toReject) return;
    await reject.mutateAsync({ id: toReject.id, note });
    setToReject(null);
    setNote('');
  };

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">طلبات الاشتراك</h1>
          <p className="mt-1 text-sm text-text-secondary">
            راجِع وفعّل طلبات باقات الشركات. التفعيل يدوي بالكامل.
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s ? STATUS_LABEL[s] : 'كل الحالات'}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <p className="text-red-400">تعذّر تحميل الطلبات.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-gray-light">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="border-b border-border bg-gray text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">الشركة</th>
                <th className="px-4 py-3">الباقة</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">مقدّم الطلب</th>
                <th className="px-4 py-3">التاريخ</th>
                <th className="px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(subs ?? []).map((sub) => (
                <tr key={sub.id} className="hover:bg-gray transition-colors">
                  <td className="px-4 py-3 font-medium text-text">{sub.company_name}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {sub.plan.name}
                    <span className="mr-1 text-xs text-text-secondary">
                      ({Number(sub.plan.price) === 0 ? 'مجاني' : `${Number(sub.plan.price)} ${sub.plan.currency}`})
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[sub.status] ?? 'default'}>
                      {STATUS_LABEL[sub.status] ?? sub.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{sub.requested_by_username || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-secondary">{formatDate(sub.created_at)}</td>
                  <td className="px-4 py-3">
                    {sub.status === 'PENDING' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => activate.mutate({ id: sub.id })}
                          disabled={activate.isPending}
                          className="rounded border border-accent/40 px-2 py-1 text-xs text-accent hover:bg-accent/10 disabled:opacity-50"
                        >
                          تفعيل
                        </button>
                        <button
                          type="button"
                          onClick={() => setToReject(sub)}
                          className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          رفض
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-text-secondary">{sub.note || '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
              {(subs ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                    لا توجد طلبات مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

export default SubscriptionsPage;
