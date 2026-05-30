import { StatCard } from '../../../components/ui/StatCard';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
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

const Dashboard = () => {
  const { data, isLoading, isError } = useOverview();

  // 1. Weekly Activity Data
  const weeklyActivityData = [
    { day: 'السبت', activeUsers: 120, actions: 340 },
    { day: 'الأحد', activeUsers: 150, actions: 420 },
    { day: 'الاثنين', activeUsers: 180, actions: 510 },
    { day: 'الثلاثاء', activeUsers: 220, actions: 680 },
    { day: 'الأربعاء', activeUsers: 200, actions: 600 },
    { day: 'الخميس', activeUsers: 240, actions: 710 },
    { day: 'الجمعة', activeUsers: 170, actions: 490 },
  ];

  // 2. Technology Usage Data
  const techUsageData = [
    { name: 'React', value: 35, fill: 'var(--color-accent)' },
    { name: 'Java', value: 25, fill: 'var(--color-blue-500)' },
    { name: 'CSS', value: 20, fill: 'var(--color-yellow-500)' },
    { name: 'Python', value: 20, fill: 'var(--color-red-500)' },
  ];
  const techCells = techUsageData.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.fill} />
  ));

  // 3. Reports & Feedback Data
  const reportsData = [
    {
      id: 1,
      user: 'خالد العتيبي',
      status: 'Bug',
      statusText: 'خطأ برمجية',
      content: 'حدثت مشكلة أثناء محاولة تحميل الملفات بصيغة PNG، يرجى التحقق من أداء الخادم.',
      colorClass: 'text-red-500',
      bgClass: 'bg-red-500/10 border-red-500/20'
    },
    {
      id: 2,
      user: 'سارة الشمري',
      status: 'Feedback',
      statusText: 'رأي مستخدم',
      content: 'تصميم لوحة التحكم مذهل والوضع الداكن مريح للعينين بشكل لا يصدق.',
      colorClass: 'text-blue-500',
      bgClass: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 3,
      user: 'محمد الدوسري',
      status: 'Improvement',
      statusText: 'تحسين مقترح',
      content: 'سيكون من المفيد إضافة تصفية وتصنيف للنشاطات الأخيرة حسب نوع المشرف.',
      colorClass: 'text-yellow-500',
      bgClass: 'bg-yellow-500/10 border-yellow-500/20'
    },
    {
      id: 4,
      user: 'نورة الحربي',
      status: 'Solved',
      statusText: 'محلول',
      content: 'تم بنجاح تعديل إعدادات الخصوصية للشركات الجديدة، شكراً لكم.',
      colorClass: 'text-accent',
      bgClass: 'bg-accent/10 border-accent/20'
    },
  ];
  const reportsList = reportsData.map((report) => (
    <div key={report.id} className="rounded-xl border border-border bg-gray-light p-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h3 className={`font-semibold text-sm ${report.colorClass}`}>{report.user}</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${report.bgClass} ${report.colorClass}`}>
          {report.statusText}
        </span>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{report.content}</p>
    </div>
  ));

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
                <YAxis stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-gray-light)', borderColor: 'var(--color-border)', borderRadius: '0.75rem', textAlign: 'right' }} 
                  labelStyle={{ color: 'var(--color-text)' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="actions" name="العمليات" stroke="var(--color-accent)" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="activeUsers" name="المستخدمون النشطون" stroke="var(--color-blue-500)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technology Usage Statistics */}
        <div className="rounded-xl border border-border bg-gray-light p-6 animate-fade-in">
          <h2 className="mb-4 text-sm font-semibold text-text-secondary">إحصائيات استخدام التقنيات</h2>
          <div className="h-64 flex items-center justify-center" dir="ltr">
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

      {/* Reports & Feedback Section */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">البلاغات والآراء</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reportsList}
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
