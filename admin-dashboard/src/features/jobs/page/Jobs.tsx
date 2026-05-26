import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../useJobs';
import { Modal } from '../../../components/ui/Modal';
import {
  Briefcase, PlusCircle, MapPin, DollarSign,
  CalendarDays, Loader2, Trash2, Users, X,
} from 'lucide-react';

const formatSalary = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });

const Jobs: React.FC = () => {
  const {
    jobs, isLoading, error,
    isModalOpen, openModal, closeModal,
    form, updateField,
    isSubmitting, submitJob, formError,
    deletingId, deleteJob,
  } = useJobs();

  return (
    <div className="min-h-screen text-text p-6 md:p-10 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20 text-accent shadow-glow">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text font-arabic">وظائفي</h1>
              <p className="text-sm text-text-secondary font-arabic mt-0.5">
                {isLoading ? '...' : `${jobs.length} وظيفة منشورة`}
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-arabic hover:bg-accent/15 hover:shadow-glow transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            نشر وظيفة جديدة
          </button>
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
          <div className="text-center py-20 text-red-400 font-arabic text-sm">{error}</div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && !error && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gray-dark border border-border flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-text-secondary opacity-50" />
            </div>
            <div className="text-center">
              <p className="text-text-secondary font-arabic font-medium">لا توجد وظائف بعد</p>
              <p className="text-text-secondary/60 font-arabic text-sm mt-1">ابدأ بنشر أول وظيفة لشركتك</p>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-arabic hover:bg-accent/15 hover:shadow-glow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              نشر وظيفة
            </button>
          </div>
        )}

        {/* ── Job cards ── */}
        {!isLoading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group relative flex flex-col gap-4 p-6 rounded-xl border border-border bg-gray-light card-neon"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text font-arabic">{job.title}</h3>
                      <p className="text-sm text-text-secondary font-arabic">{job.company}</p>
                    </div>
                  </div>

                  {/* Hover actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                      to="/dashboard/applicants"
                      title="المتقدمون"
                      className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 hover:shadow-glow transition-all"
                    >
                      <Users className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteJob(job.id)}
                      disabled={deletingId === job.id}
                      title="حذف"
                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                    >
                      {deletingId === job.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
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
                    {formatDate(job.created_at)}
                  </span>
                </div>

                {/* Subtle bottom accent line on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-accent/0 group-hover:bg-accent/20 transition-all duration-300 rounded-b-xl" />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── Create Job Modal ── */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="نشر وظيفة جديدة">
        <div className="space-y-4 font-arabic" dir="rtl">

          {formError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <X className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          {[
            { field: 'title',   label: 'المسمى الوظيفي *',  placeholder: 'مثال: مطور Frontend', type: 'text'   },
            { field: 'company', label: 'اسم الشركة *',       placeholder: 'مثال: TechCorp',      type: 'text'   },
            { field: 'location',label: 'الموقع',              placeholder: 'مثال: الرياض، عن بُعد', type: 'text' },
          ].map(({ field, label, placeholder, type }) => (
            <div key={field}>
              <label className="block text-xs text-text-secondary mb-1.5">{label}</label>
              <input
                type={type}
                value={form[field as keyof typeof form] as string}
                onChange={(e) => updateField(field as keyof typeof form, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-gray border border-border text-text text-sm rounded-lg px-4 py-2.5 input-neon placeholder-text-secondary/40 transition-all"
              />
            </div>
          ))}

          {/* Salary range */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { field: 'min_salary', label: 'الحد الأدنى (ر.س)', placeholder: '8000'  },
              { field: 'max_salary', label: 'الحد الأقصى (ر.س)', placeholder: '15000' },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="block text-xs text-text-secondary mb-1.5">{label}</label>
                <input
                  type="number"
                  min={0}
                  value={(form[field as keyof typeof form] as number) || ''}
                  onChange={(e) => updateField(field as keyof typeof form, Number(e.target.value))}
                  placeholder={placeholder}
                  className="w-full bg-gray border border-border text-text text-sm rounded-lg px-4 py-2.5 input-neon placeholder-text-secondary/40 transition-all"
                />
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">وصف الوظيفة *</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="اكتب تفاصيل الوظيفة، المتطلبات، والمهام المطلوبة..."
              className="w-full bg-gray border border-border text-text text-sm rounded-lg px-4 py-2.5 input-neon placeholder-text-secondary/40 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={submitJob}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-arabic hover:bg-accent/15 hover:shadow-glow disabled:opacity-50 transition-all"
            >
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ النشر...</>
                : <><PlusCircle className="w-4 h-4" /> نشر الوظيفة</>}
            </button>
            <button
              onClick={closeModal}
              className="px-5 py-2.5 rounded-lg border border-border text-text-secondary text-sm font-arabic hover:border-border/80 hover:text-text transition-colors"
            >
              إلغاء
            </button>
          </div>

        </div>
      </Modal>
    </div>
  );
};

export default Jobs;
