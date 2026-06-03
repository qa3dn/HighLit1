import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { useActivity } from '../useActivity';
import type { AuditEvent } from '../activityService';

const columns: Column<AuditEvent>[] = [
  { key: 'action', header: 'الإجراء', render: (e) => <Badge variant="info">{e.action}</Badge> },
  { key: 'actor', header: 'المنفّذ', render: (e) => <span className="text-text-secondary">{e.actor_username || 'النظام'}</span> },
  {
    key: 'target',
    header: 'الهدف',
    render: (e) => (
      <span className="text-text-secondary">{e.target_type ? `${e.target_type}#${e.target_id}` : '—'}</span>
    ),
  },
  { key: 'ip', header: 'IP', render: (e) => <span className="font-mono text-xs text-text-secondary">{e.ip || '—'}</span> },
  {
    key: 'time',
    header: 'الوقت',
    render: (e) => (
      <span className="whitespace-nowrap text-text-secondary">
        {new Date(e.created_at).toLocaleString('ar-EG')}
      </span>
    ),
  },
];

const ActivityPage = () => {
  const [action, setAction] = useState('');
  const [query, setQuery] = useState('');
  const { data, isLoading, isError } = useActivity(query ? { action: query } : {});

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">سجل النشاط والتدقيق</h1>
          <p className="text-sm text-text-secondary">كل إجراء حسّاس مسجّل هنا (للقراءة فقط).</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(action.trim());
          }}
          className="flex gap-2"
        >
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="تصفية بالإجراء (مثل user.banned)"
            className="rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
          <Button type="submit" variant="secondary" size="sm">
            تصفية
          </Button>
        </form>
      </div>

      {isError ? (
        <p className="text-red-400">تعذّر تحميل سجل النشاط.</p>
      ) : (
        <DataTable
          columns={columns}
          rows={data?.results ?? []}
          keyField={(e) => e.id}
          loading={isLoading}
          empty="لا يوجد نشاط مسجّل."
        />
      )}
    </div>
  );
};

export default ActivityPage;
