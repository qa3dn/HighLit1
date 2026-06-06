import { StatCard } from '../../../components/ui/StatCard';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { Star } from 'lucide-react';
import { useOverview } from '../useDashboard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Palette for the technology-usage pie slices (assigned by index).
const TECH_COLORS = ['#00ff41', '#3b82f6', '#eab308', '#ef4444', '#a855f7', '#06b6d4'];

const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-3.5 h-3.5 ${i < rating ? 'text-accent fill-accent' : 'text-gray-dark fill-transparent'}`}
    />
  ));

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

  // Real analytics from the overview endpoint.
  const weeklyActivityData = data.weekly_activity.map((point) => ({
    day: new Date(`${point.date}T00:00:00`).toLocaleDateString('ar', { weekday: 'short' }),
    activeUsers: point.active_users,
    actions: point.actions,
  }));
  const techUsageData = data.tech_usage.map((slice, index) => ({
    ...slice,
    fill: TECH_COLORS[index % TECH_COLORS.length],
  }));
  const techCells = techUsageData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />);

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
      {/* Charts Section */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Activity Analytics */}
        <div className="rounded-xl border border-border bg-gray-light p-6 animate-fade-in">
          <h2 className="mb-4 text-sm font-semibold text-text-secondary">تحليلات النشاط الأسبوعي</h2>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-gray-light)', borderColor: 'var(--color-border)', borderRadius: '0.75rem', textAlign: 'right' }}
                  labelStyle={{ color: 'var(--color-text)' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="actions" name="العمليات" stroke="#00ff41" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="activeUsers" name="المستخدمون النشطون" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Technology Usage Statistics */}
        <div className="rounded-xl border border-border bg-gray-light p-6 animate-fade-in">
          <h2 className="mb-4 text-sm font-semibold text-text-secondary">إحصائيات استخدام التقنيات</h2>
          <div className="h-64 flex items-center justify-center" dir="ltr">
            {techUsageData.length === 0 ? (
              <p className="text-sm text-text-secondary font-arabic" dir="rtl">لا توجد بيانات تقنيات بعد.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={techUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {techCells}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-gray-light)', borderColor: 'var(--color-border)', borderRadius: '0.75rem', textAlign: 'right' }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
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
      {/* User Reviews Section */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">أحدث التقييمات</h2>
        {data.recent_reviews.length === 0 ? (
          <div className="rounded-xl border border-border bg-gray-light p-6 text-center text-sm text-text-secondary">
            لا توجد تقييمات بعد.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.recent_reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-border bg-gray-light p-4 animate-fade-in">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="font-semibold text-sm text-text truncate">{review.author}</h3>
                  <div className="flex items-center gap-0.5 shrink-0">{renderStars(review.rating)}</div>
                </div>
                {review.job_title && (
                  <p className="text-xs text-text-secondary mb-2 truncate">{review.job_title}</p>
                )}
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                  {review.comment || '—'}
                </p>
              </div>
            ))}
          </div>
        )}
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
