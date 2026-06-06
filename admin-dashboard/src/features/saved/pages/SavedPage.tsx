import React from 'react';
import { useSaved } from '../useSaved';
import {
  Bookmark, MapPin, DollarSign, CalendarDays,
  Loader2, BookmarkX, Building2, X,
} from 'lucide-react';

const formatSalary = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });

const SavedPage: React.FC = () => {
  const { savedJobs, isLoading, error, unsavingId, unsaveJob } = useSaved();

  return (
    <div className="text-text" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20 text-accent shadow-glow">
            <Bookmark className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text font-arabic">المحفوظات</h1>
            <p className="text-sm text-text-secondary font-arabic mt-0.5">
              {isLoading ? '...' : `${savedJobs.length} وظيفة محفوظة`}
            </p>
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3 text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="font-arabic text-sm">جارٍ التحميل...</span>
          </div>
        )}

        {/* ── Error ── */}
        {!isLoading && error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-arabic">
            <X className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && !error && savedJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gray-dark border border-border flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-text-secondary opacity-50" />
            </div>
            <div className="text-center">
              <p className="text-text-secondary font-arabic font-medium">لا توجد وظائف محفوظة</p>
              <p className="text-text-secondary/60 font-arabic text-sm mt-1">احفظ الوظائف التي تهمك للرجوع إليها لاحقًا</p>
            </div>
          </div>
        )}

        {/* ── Saved job cards ── */}
        {!isLoading && !error && savedJobs.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="group relative flex flex-col gap-4 p-6 rounded-xl border border-border bg-gray-light card-neon"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text font-arabic">{job.title}</h3>
                      <p className="text-sm text-text-secondary font-arabic">{job.company}</p>
                    </div>
                  </div>

                  {/* Unsave button (visible on hover) */}
                  <button
                    onClick={() => unsaveJob(job.id)}
                    disabled={unsavingId === job.id}
                    title="إزالة من المحفوظات"
                    className="opacity-0 group-hover:opacity-100 shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-arabic hover:bg-yellow-500/20 transition-all duration-200 disabled:opacity-40"
                  >
                    {unsavingId === job.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <BookmarkX className="w-3.5 h-3.5" />}
                    إزالة
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary font-arabic leading-relaxed line-clamp-2">
                  {job.description}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                  {job.location && (
                    <span className="flex items-center gap-1.5 font-arabic">
                      <MapPin className="w-3.5 h-3.5 opacity-60" />
                      {job.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 opacity-60" />
                    <span className="font-arabic">
                      {formatSalary(job.min_salary)} – {formatSalary(job.max_salary)} ر.س
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 font-arabic">
                    <CalendarDays className="w-3.5 h-3.5 opacity-60" />
                    حُفظت {formatDate(job.saved_at)}
                  </span>
                </div>

                {/* Bottom accent line on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-accent/0 group-hover:bg-accent/20 transition-all duration-300 rounded-b-xl" />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SavedPage;
