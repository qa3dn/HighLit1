import React from 'react';
import { useApplicants } from '../useApplicants';
import type { Applicant } from '../applicantsService';
import {
  Users, Clock, CheckCircle2, XCircle,
  ChevronDown, Loader2, Mail, Briefcase,
} from 'lucide-react';

const STATUS_LABEL: Record<Applicant['status'], string> = {
  PENDING:  'قيد المراجعة',
  ACCEPTED: 'مقبول',
  REJECTED: 'مرفوض',
};

const STATUS_STYLES: Record<Applicant['status'], string> = {
  PENDING:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  ACCEPTED: 'bg-accent/10    text-accent     border-accent/20',
  REJECTED: 'bg-red-500/10   text-red-400    border-red-500/20',
};

const StatCard: React.FC<{
  label: string; value: number; icon: React.ReactNode; accent: string;
}> = ({ label, value, icon, accent }) => (
  <div className={`flex items-center gap-4 p-5 rounded-xl border border-border bg-gray-light card-neon`}>
    <div className={`p-3 rounded-xl border ${accent}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-sm text-text-secondary font-arabic mt-0.5">{label}</p>
    </div>
  </div>
);

const Applicants: React.FC = () => {
  const {
    jobs, selectedJobId, setSelectedJobId,
    applicants, isLoading, error,
    statusFilter, setStatusFilter,
    updateStatus, stats,
  } = useApplicants();

  return (
    <div className="min-h-screen text-text p-6 md:p-10 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20 text-accent shadow-glow">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text font-arabic">المتقدمون</h1>
              <p className="text-sm text-text-secondary font-arabic mt-0.5">إدارة طلبات التوظيف الواردة</p>
            </div>
          </div>

          {/* Job selector */}
          <div className="relative">
            <select
              value={selectedJobId ?? ''}
              onChange={(e) => setSelectedJobId(Number(e.target.value))}
              className="appearance-none bg-gray border border-border text-text text-sm rounded-lg px-4 py-2.5 pr-9 font-arabic focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors cursor-pointer"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="إجمالي المتقدمين" value={stats.total}    icon={<Users        className="w-5 h-5 text-blue-400"   />} accent="bg-blue-500/10   border-blue-500/20"   />
          <StatCard label="قيد المراجعة"      value={stats.pending}  icon={<Clock        className="w-5 h-5 text-yellow-400" />} accent="bg-yellow-500/10 border-yellow-500/20" />
          <StatCard label="مقبولون"            value={stats.accepted} icon={<CheckCircle2 className="w-5 h-5 text-accent"    />} accent="bg-accent/10     border-accent/20"     />
          <StatCard label="مرفوضون"            value={stats.rejected} icon={<XCircle      className="w-5 h-5 text-red-400"   />} accent="bg-red-500/10   border-red-500/20"    />
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-arabic border transition-all duration-200 ${
                statusFilter === f
                  ? 'bg-accent/10 text-accent border-accent/30 shadow-glow'
                  : 'bg-transparent text-text-secondary border-border hover:border-border/80 hover:text-text'
              }`}
            >
              {f === 'ALL' ? 'الكل' : STATUS_LABEL[f]}
              {f !== 'ALL' && (
                <span className="mr-1.5 text-xs opacity-70">
                  ({f === 'PENDING' ? stats.pending : f === 'ACCEPTED' ? stats.accepted : stats.rejected})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-border bg-gray-light overflow-hidden card-neon">
          {/* Table header */}
          <div className="grid grid-cols-12 px-6 py-3 border-b border-border bg-gray/60 text-xs font-semibold text-text-secondary uppercase tracking-wider">
            <span className="col-span-4">المتقدم</span>
            <span className="col-span-3">البريد الإلكتروني</span>
            <span className="col-span-2">تاريخ التقديم</span>
            <span className="col-span-1 text-center">الحالة</span>
            <span className="col-span-2 text-center">الإجراء</span>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-text-secondary">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span className="font-arabic text-sm">جارٍ التحميل...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex items-center justify-center py-16 text-red-400 font-arabic text-sm">
              حدث خطأ أثناء تحميل البيانات
            </div>
          )}

          {!isLoading && !error && applicants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-secondary">
              <Briefcase className="w-10 h-10 opacity-30" />
              <p className="font-arabic text-sm">لا يوجد متقدمون لهذه الوظيفة</p>
            </div>
          )}

          {!isLoading && !error && applicants.map((applicant, idx) => (
            <div
              key={applicant.id}
              className={`grid grid-cols-12 px-6 py-4 items-center gap-2 transition-colors hover:bg-gray-dark/40 ${
                idx !== applicants.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              {/* Name */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                  {applicant.applicant_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-text font-arabic">{applicant.applicant_name}</p>
                  {applicant.cover_letter && (
                    <p className="text-xs text-text-secondary font-arabic truncate max-w-[160px]" title={applicant.cover_letter}>
                      {applicant.cover_letter}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="col-span-3 flex items-center gap-1.5 text-text-secondary text-sm">
                <Mail className="w-3.5 h-3.5 shrink-0 opacity-50" />
                <span className="truncate">{applicant.applicant_email}</span>
              </div>

              {/* Date */}
              <div className="col-span-2 text-text-secondary text-xs font-arabic">
                {new Date(applicant.applied_at).toLocaleDateString('ar-SA', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </div>

              {/* Status badge */}
              <div className="col-span-1 flex justify-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border font-arabic ${STATUS_STYLES[applicant.status]}`}>
                  {STATUS_LABEL[applicant.status]}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-center gap-2">
                {applicant.status !== 'ACCEPTED' && (
                  <button
                    onClick={() => updateStatus(applicant.id, 'ACCEPTED')}
                    title="قبول"
                    className="p-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 hover:shadow-glow transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                {applicant.status !== 'REJECTED' && (
                  <button
                    onClick={() => updateStatus(applicant.id, 'REJECTED')}
                    title="رفض"
                    className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
                {applicant.status !== 'PENDING' && (
                  <button
                    onClick={() => updateStatus(applicant.id, 'PENDING')}
                    title="إعادة للمراجعة"
                    className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Applicants;
