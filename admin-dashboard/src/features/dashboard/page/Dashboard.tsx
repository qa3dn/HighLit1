import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useDashboard } from '../useDashboard';
import type { Applicant } from '../../applicants/applicantsService';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  TrendingUp,
  PlusCircle,
  MapPin,
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────

const STATUS_STYLES: Record<Applicant['status'], string> = {
  PENDING:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  ACCEPTED: 'bg-accent/10    text-accent     border-accent/20',
  REJECTED: 'bg-red-500/10   text-red-400    border-red-500/20',
};
const STATUS_LABEL: Record<Applicant['status'], string> = {
  PENDING:  'قيد المراجعة',
  ACCEPTED: 'مقبول',
  REJECTED: 'مرفوض',
};

const StatCard: React.FC<{
  label: string; value: number;
  icon: React.ReactNode; accent: string; sub?: string;
}> = ({ label, value, icon, accent, sub }) => (
  <div className="relative overflow-hidden flex flex-col gap-4 p-6 rounded-xl border border-border bg-gray-light card-neon">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${accent}`}>
      {icon}
    </div>
    <div>
      <p className="text-3xl font-bold text-text">{value}</p>
      <p className="text-sm text-text-secondary font-arabic mt-1">{label}</p>
      {sub && <p className="text-xs text-text-secondary/60 font-arabic mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Company Dashboard ──────────────────────────────────────────

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { jobs, recentApplicants, stats, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-accent animate-spin" />
          <p className="text-text-secondary text-sm font-arabic animate-pulse-soft">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-text p-6 md:p-10 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ── Welcome header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-sm text-text-secondary font-arabic mb-1">مرحباً بك،</p>
            <h1 className="text-2xl font-bold text-text font-arabic">
              {user?.name ?? 'الشركة'} 👋
            </h1>
            <p className="text-sm text-text-secondary font-arabic mt-1">
              إليك نظرة عامة على نشاط التوظيف لديك
            </p>
          </div>
          <Link
            to="/dashboard/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-arabic hover:bg-accent/15 hover:shadow-glow transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            نشر وظيفة جديدة
          </Link>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="وظائف منشورة"     value={stats.totalJobs}        icon={<Briefcase   className="w-5 h-5 text-blue-400"   />} accent="bg-blue-500/10    border-blue-500/20"    />
          <StatCard label="إجمالي المتقدمين"  value={stats.totalApplicants}  icon={<TrendingUp  className="w-5 h-5 text-purple-400" />} accent="bg-purple-500/10  border-purple-500/20"  />
          <StatCard label="قيد المراجعة"      value={stats.pending}          icon={<Clock       className="w-5 h-5 text-yellow-400" />} accent="bg-yellow-500/10  border-yellow-500/20"  />
          <StatCard label="مقبولون"            value={stats.accepted}         icon={<CheckCircle2 className="w-5 h-5 text-accent"    />} accent="bg-accent/10      border-accent/20"      />
        </div>

        {/* ── Two-column section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* My Jobs */}
          <div className="lg:col-span-3 rounded-xl border border-border bg-gray-light overflow-hidden card-neon">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-text font-arabic flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                وظائفي
              </h2>
              <Link to="/dashboard/jobs" className="flex items-center gap-1 text-xs text-accent hover:text-glow font-arabic transition-all">
                عرض الكل <ArrowLeft className="w-3 h-3" />
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-text-secondary">
                <Briefcase className="w-8 h-8 opacity-30" />
                <p className="font-arabic text-sm">لا توجد وظائف منشورة بعد</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {jobs.map((job) => (
                  <li key={job.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-dark/40 transition-colors">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-text font-arabic">{job.title}</span>
                      {job.location && (
                        <span className="flex items-center gap-1 text-xs text-text-secondary font-arabic">
                          <MapPin className="w-3 h-3" /> {job.location}
                        </span>
                      )}
                    </div>
                    <Link
                      to="/dashboard/applicants"
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-dark border border-border text-xs text-text-secondary hover:border-accent/30 hover:text-accent transition-all font-arabic"
                    >
                      <Users className="w-3 h-3" />
                      {job.applicant_count} متقدم
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Applicants */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-gray-light overflow-hidden card-neon">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-text font-arabic flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                آخر المتقدمين
              </h2>
              <Link to="/dashboard/applicants" className="flex items-center gap-1 text-xs text-accent hover:text-glow font-arabic transition-all">
                عرض الكل <ArrowLeft className="w-3 h-3" />
              </Link>
            </div>

            {recentApplicants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-text-secondary">
                <Users className="w-8 h-8 opacity-30" />
                <p className="font-arabic text-sm">لا يوجد متقدمون بعد</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentApplicants.map((applicant) => (
                  <li key={applicant.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-dark/40 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                      {applicant.applicant_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text font-arabic truncate">{applicant.applicant_name}</p>
                      <p className="text-xs text-text-secondary font-arabic truncate">{applicant.job_title}</p>
                    </div>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-arabic ${STATUS_STYLES[applicant.status]}`}>
                      {STATUS_LABEL[applicant.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'نشر وظيفة جديدة',   icon: <PlusCircle   className="w-5 h-5" />, to: '/dashboard/jobs',       color: 'text-blue-400   bg-blue-500/10   border-blue-500/20   hover:bg-blue-500/15   hover:border-blue-400/40'   },
            { label: 'مراجعة المتقدمين',    icon: <Users        className="w-5 h-5" />, to: '/dashboard/applicants', color: 'text-accent     bg-accent/10     border-accent/20     hover:bg-accent/15     hover:border-accent/40 hover:shadow-glow'     },
            { label: 'المتقدمون المقبولون', icon: <CheckCircle2 className="w-5 h-5" />, to: '/dashboard/applicants', color: 'text-purple-400  bg-purple-500/10  border-purple-500/20  hover:bg-purple-500/15  hover:border-purple-400/40' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl border font-arabic text-sm font-medium transition-all duration-200 ${action.color}`}
            >
              {action.icon}
              {action.label}
            </Link>
          ))}
        </div>

        {/* ── Footer stat ── */}
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-border bg-gray-light text-sm text-text-secondary font-arabic">
          <XCircle className="w-4 h-4 text-red-500/60 shrink-0" />
          <span>
            تم رفض <span className="text-red-400 font-semibold">{stats.rejected}</span> طلب حتى الآن.
          </span>
        </div>

      </div>
    </div>
  );
};

// ── Root export — role-aware ────────────────────────────────────

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'company') return <CompanyDashboard />;

  return (
    <div className="flex items-center justify-center min-h-screen text-text-secondary font-arabic text-sm">
      لوحة التحكم — قيد التطوير لهذا الدور
    </div>
  );
};

export default Dashboard;
