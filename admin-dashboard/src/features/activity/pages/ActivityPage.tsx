import { useState } from 'react';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useActivity } from '../useActivity';

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

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <p className="text-red-400">تعذّر تحميل سجل النشاط.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-gray-light">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="border-b border-border bg-gray text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">الإجراء</th>
                <th className="px-4 py-3">المنفّذ</th>
                <th className="px-4 py-3">الهدف</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data?.results ?? []).map((event) => (
                <tr key={event.id} className="hover:bg-gray transition-colors">
                  <td className="px-4 py-3">
                    <Badge variant="info">{event.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {event.actor_username || 'النظام'}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {event.target_type ? `${event.target_type}#${event.target_id}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                    {event.ip || '—'}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(event.created_at).toLocaleString('ar-EG')}
                  </td>
                </tr>
              ))}
              {(data?.results ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                    لا يوجد نشاط مسجّل.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
