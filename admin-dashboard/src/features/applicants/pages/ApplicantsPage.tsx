import React, { useState } from 'react';
import { useApplicants } from '../useApplicants';
import { ApplicantDrawer } from '../components/ApplicantDrawer';
import type { Applicant, ApplicationStatus } from '../applicantsService';
import {
  Users, Clock, CheckCircle2, Star,
  ChevronDown, Loader2, Mail, Briefcase, Sparkles, FileText,
} from 'lucide-react';

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: 'قيد المراجعة',
  REVIEWED: 'تمت المراجعة',
  SHORTLISTED: 'القائمة المختصرة',
  ACCEPTED: 'مقبول',
  REJECTED: 'مرفوض',
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  REVIEWED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SHORTLISTED: 'bg-accent/10 text-accent border-accent/20',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const FILTERS: (ApplicationStatus | 'ALL')[] = ['ALL', 'PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];

function matchStyle(pct: number): string {
  if (pct >= 75) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (pct >= 40) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  return 'bg-gray-dark/40 text-text-secondary border-border';
}

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; accent: string }> = ({
  label, value, icon, accent,
}) => (
  <div className="flex items-center gap-4 rounded-xl border border-border bg-gray-light p-5 card-neon">
    <div className={`rounded-xl border p-3 ${accent}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="mt-0.5 font-arabic text-sm text-text-secondary">{label}</p>
    </div>
  </div>
);

const ApplicantsPage: React.FC = () => {
  const {
    jobs, selectedJobId, setSelectedJobId,
    applicants, isLoading, error,
    statusFilter, setStatusFilter, sort, setSort,
    updateStatus, stats,
  } = useApplicants();

  const [selected, setSelected] = useState<Applicant | null>(null);

  return (
    <div className="text-text" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-accent/20 bg-accent/10 p-3 text-accent shadow-glow">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-arabic text-2xl font-bold text-text">المتقدمون</h1>
              <p className="mt-0.5 font-arabic text-sm text-text-secondary">إدارة طلبات التوظيف الواردة وتقييم المرشحين</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedJobId ?? ''}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
                className="cursor-pointer appearance-none rounded-lg border border-border bg-gray px-4 py-2.5 pr-9 font-arabic text-sm text-text transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            </div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'recent' | 'match')}
                className="cursor-pointer appearance-none rounded-lg border border-border bg-gray px-4 py-2.5 pr-9 font-arabic text-sm text-text transition-colors focus:border-accent/50 focus:outline-none"
              >
                <option value="recent">الأحدث</option>
                <option value="match">الأفضل مطابقة</option>
              </select>
              <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="إجمالي المتقدمين" value={stats.total} icon={<Users className="h-5 w-5 text-blue-400" />} accent="bg-blue-500/10 border-blue-500/20" />
          <StatCard label="قيد المراجعة" value={stats.pending} icon={<Clock className="h-5 w-5 text-yellow-400" />} accent="bg-yellow-500/10 border-yellow-500/20" />
          <StatCard label="القائمة المختصرة" value={stats.shortlisted} icon={<Star className="h-5 w-5 text-accent" />} accent="bg-accent/10 border-accent/20" />
          <StatCard label="مقبولون" value={stats.accepted} icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />} accent="bg-emerald-500/10 border-emerald-500/20" />
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-full border px-4 py-1.5 font-arabic text-sm transition-all duration-200 ${
                statusFilter === f
                  ? 'border-accent/30 bg-accent/10 text-accent shadow-glow'
                  : 'border-border bg-transparent text-text-secondary hover:border-border/80 hover:text-text'
              }`}
            >
              {f === 'ALL' ? 'الكل' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 font-arabic text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-gray-light card-neon">
          {/* Header (desktop) */}
          <div className="hidden grid-cols-12 border-b border-border bg-gray/60 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary md:grid">
            <span className="col-span-4">المتقدم</span>
            <span className="col-span-2 text-center">المطابقة</span>
            <span className="col-span-3">البريد الإلكتروني</span>
            <span className="col-span-1 text-center">الحالة</span>
            <span className="col-span-2 text-center">التفاصيل</span>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-16 text-text-secondary">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <span className="font-arabic text-sm">جارٍ التحميل...</span>
            </div>
          )}

          {!isLoading && !error && applicants.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-secondary">
              <Briefcase className="h-10 w-10 opacity-30" />
              <p className="font-arabic text-sm">لا يوجد متقدمون مطابقون</p>
            </div>
          )}

          {!isLoading && applicants.map((a, idx) => {
            const u = a.applicant;
            const name = a.full_name || u.username;
            const email = a.email || u.email || '';
            return (
              <div
                key={a.id}
                className={`grid grid-cols-2 items-center gap-2 px-4 py-4 transition-colors hover:bg-gray-dark/40 md:grid-cols-12 md:px-6 ${
                  idx !== applicants.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                {/* Name */}
                <div className="col-span-2 flex items-center gap-3 md:col-span-4">
                  {a.photo_url || u.avatar_url ? (
                    <img src={a.photo_url || u.avatar_url} alt={name} className="h-9 w-9 shrink-0 rounded-full border border-border object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-sm font-bold text-accent">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-arabic text-sm font-medium text-text">{name}</p>
                    <p className="truncate font-arabic text-xs text-text-secondary">{a.headline || `@${u.username}`}</p>
                  </div>
                </div>

                {/* Match */}
                <div className="order-3 flex justify-center md:order-none md:col-span-2">
                  {a.skill_match !== null ? (
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${matchStyle(a.skill_match)}`}>
                      <Sparkles className="h-3 w-3" /> {a.skill_match}%
                    </span>
                  ) : (
                    <span className="text-xs text-text-secondary">—</span>
                  )}
                </div>

                {/* Email */}
                <div className="col-span-2 flex items-center gap-1.5 text-sm text-text-secondary md:col-span-3" dir="ltr">
                  <Mail className="h-3.5 w-3.5 shrink-0 opacity-50" />
                  <span className="truncate">{email || '—'}</span>
                </div>

                {/* Status */}
                <div className="flex justify-start md:col-span-1 md:justify-center">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-arabic text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </div>

                {/* Detail action */}
                <div className="flex items-center justify-end gap-2 md:col-span-2 md:justify-center">
                  {a.resume_url && (
                    <a
                      href={a.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="السيرة الذاتية"
                      className="rounded-lg border border-border p-1.5 text-text-secondary transition-colors hover:border-accent/50 hover:text-accent"
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => setSelected(a)}
                    className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 font-arabic text-xs font-medium text-accent transition-all hover:bg-accent/20 hover:shadow-glow"
                  >
                    عرض الملف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ApplicantDrawer
        applicant={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
        onStatus={(id, status) => {
          updateStatus(id, status);
          setSelected((prev) => (prev ? { ...prev, status } : prev));
        }}
      />
    </div>
  );
};

export default ApplicantsPage;
