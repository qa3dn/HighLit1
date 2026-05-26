import { StatCard } from '../../../components/ui/StatCard';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { useOverview } from '../useDashboard';

const Dashboard = () => {
  const { data, isLoading, isError } = useOverview();

  if (isLoading) return <Loader fullScreen />;

  if (isError || !data) {
    return (
      <div dir="rtl" className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
        تعذّر تحميل لوحة المعلومات. تأكد من تسجيل الدخول كمسؤول (ADMIN) ومن تشغيل الخادم.
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">نظرة عامة</h1>
        <p className="text-sm text-text-secondary">ملخّص حيّ لحالة المنصة.</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">المستخدمون</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="إجمالي المستخدمين" value={data.users.total} accent />
          <StatCard label="المسؤولون" value={data.users.admins} />
          <StatCard label="الشركات" value={data.users.companies} />
          <StatCard label="محظورون" value={data.users.banned} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">المحتوى والمشاريع</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="المنشورات" value={data.content.posts} />
          <StatCard label="التعليقات" value={data.content.comments} />
          <StatCard label="مشاريع منشورة" value={data.projects.published} accent />
          <StatCard label="مشاريع مرفوضة" value={data.projects.rejected} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">الشركات والوظائف</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="إجمالي الشركات" value={data.companies.total} accent />
          <StatCard label="شركات موثّقة" value={data.companies.verified} />
          <StatCard label="الوظائف" value={data.companies.jobs} />
          <StatCard label="مشاريع مخفية" value={data.projects.hidden} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">آخر النشاطات</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-gray-light">
          {data.recent_activity.length === 0 ? (
            <p className="p-6 text-center text-sm text-text-secondary">لا يوجد نشاط مسجّل بعد.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.recent_activity.map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text">
                      <span className="font-mono text-accent">{event.action}</span>
                      {event.target_type && (
                        <span className="text-text-secondary">
                          {' '}
                          · {event.target_type}#{event.target_id}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {event.actor_username || 'النظام'} ·{' '}
                      {new Date(event.created_at).toLocaleString('ar-EG')}
                    </p>
                  </div>
                  <Badge variant="info">{event.ip || '—'}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
