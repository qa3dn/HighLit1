import React from 'react';
import { useProjects } from '../useProjects';
import type { Project } from '../projectsService';
import { Modal } from '../../../components/ui/Modal';
import {
  FolderGit2, PlusCircle, CheckCircle2, Clock, Archive,
  Loader2, Trash2, GitBranch, ExternalLink, X, Code2,
  FolderOpen,
} from 'lucide-react';

// ── Status config ────────────────────────────────────────────────

const STATUS_LABEL: Record<Project['status'], string> = {
  IN_PROGRESS: 'قيد التطوير',
  COMPLETED:   'مكتمل',
  ARCHIVED:    'مؤرشف',
};

const STATUS_STYLES: Record<Project['status'], string> = {
  IN_PROGRESS: 'bg-blue-500/10   text-blue-400   border-blue-500/20',
  COMPLETED:   'bg-accent/10     text-accent     border-accent/20',
  ARCHIVED:    'bg-gray-dark/60  text-text-secondary border-border',
};

const STATUS_OPTIONS: { value: Project['status']; label: string }[] = [
  { value: 'IN_PROGRESS', label: 'قيد التطوير' },
  { value: 'COMPLETED',   label: 'مكتمل'       },
  { value: 'ARCHIVED',    label: 'مؤرشف'       },
];

// ── Stat card ────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string; value: number; icon: React.ReactNode; accent: string;
}> = ({ label, value, icon, accent }) => (
  <div className="flex items-center gap-4 p-5 rounded-xl border border-border bg-gray-light card-neon">
    <div className={`p-3 rounded-xl border ${accent}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-sm text-text-secondary font-arabic mt-0.5">{label}</p>
    </div>
  </div>
);

// ── Tech tag ─────────────────────────────────────────────────────

const TechTag: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-dark border border-border text-text-secondary font-mono">
    {label}
  </span>
);

// ── Main component ───────────────────────────────────────────────

const Projects: React.FC = () => {
  const {
    projects, isLoading, error,
    isModalOpen, openModal, closeModal,
    form, updateField,
    isSubmitting, submitProject, formError,
    deletingId, deleteProject,
    stats,
  } = useProjects();

  return (
    <div className="min-h-screen text-text p-6 md:p-10 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20 text-accent shadow-glow">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text font-arabic">مشاريعي</h1>
              <p className="text-sm text-text-secondary font-arabic mt-0.5">
                {isLoading ? '...' : `${projects.length} مشروع في محفظتك`}
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-arabic hover:bg-accent/15 hover:shadow-glow transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            إضافة مشروع
          </button>
        </div>

        {/* ── Stats ── */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="إجمالي المشاريع" value={stats.total}      icon={<FolderOpen   className="w-5 h-5 text-blue-400"   />} accent="bg-blue-500/10   border-blue-500/20"   />
            <StatCard label="مكتملة"           value={stats.completed}  icon={<CheckCircle2 className="w-5 h-5 text-accent"    />} accent="bg-accent/10     border-accent/20"     />
            <StatCard label="قيد التطوير"      value={stats.inProgress} icon={<Clock        className="w-5 h-5 text-yellow-400" />} accent="bg-yellow-500/10 border-yellow-500/20" />
            <StatCard label="مؤرشفة"           value={stats.archived}   icon={<Archive      className="w-5 h-5 text-text-secondary" />} accent="bg-gray-dark border-border" />
          </div>
        )}

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
        {!isLoading && !error && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gray-dark border border-border flex items-center justify-center">
              <FolderGit2 className="w-8 h-8 text-text-secondary opacity-50" />
            </div>
            <div className="text-center">
              <p className="text-text-secondary font-arabic font-medium">لا توجد مشاريع بعد</p>
              <p className="text-text-secondary/60 font-arabic text-sm mt-1">ابدأ ببناء محفظتك البرمجية</p>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-arabic hover:bg-accent/15 hover:shadow-glow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              إضافة مشروع
            </button>
          </div>
        )}

        {/* ── Project cards ── */}
        {!isLoading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative flex flex-col gap-4 p-6 rounded-xl border border-border bg-gray-light card-neon"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-text font-arabic truncate">{project.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border font-arabic mt-0.5 ${STATUS_STYLES[project.status]}`}>
                        {STATUS_LABEL[project.status]}
                      </span>
                    </div>
                  </div>

                  {/* Hover delete */}
                  <button
                    onClick={() => deleteProject(project.id)}
                    disabled={deletingId === project.id}
                    title="حذف"
                    className="opacity-0 group-hover:opacity-100 shrink-0 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-40"
                  >
                    {deletingId === project.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2  className="w-4 h-4" />}
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary font-arabic leading-relaxed line-clamp-2">
                  {project.description}
                </p>

                {/* Tech stack */}
                {project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech_stack.map(tech => (
                      <TechTag key={tech} label={tech} />
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition-colors"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span className="font-arabic">GitHub</span>
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="font-arabic">مباشر</span>
                      </a>
                    )}
                  </div>
                  <span className="text-xs text-text-secondary font-arabic">
                    {new Date(project.created_at).toLocaleDateString('ar-SA', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Bottom accent line on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-accent/0 group-hover:bg-accent/20 transition-all duration-300 rounded-b-xl" />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── Create Project Modal ── */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="إضافة مشروع جديد">
        <div className="space-y-4 font-arabic" dir="rtl">

          {formError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <X className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">عنوان المشروع *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => updateField('title', e.target.value)}
              placeholder="مثال: نظام إدارة المهام"
              className="w-full bg-gray border border-border text-text text-sm rounded-lg px-4 py-2.5 input-neon placeholder-text-secondary/40 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">وصف المشروع *</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="اكتب وصفاً موجزاً للمشروع وأهدافه..."
              className="w-full bg-gray border border-border text-text text-sm rounded-lg px-4 py-2.5 input-neon placeholder-text-secondary/40 transition-all resize-none"
            />
          </div>

          {/* Tech stack + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-text-secondary mb-1.5">
                التقنيات المستخدمة
                <span className="text-text-secondary/50 mr-1">(مفصولة بفاصلة)</span>
              </label>
              <input
                type="text"
                value={form.tech_stack_input}
                onChange={e => updateField('tech_stack_input', e.target.value)}
                placeholder="مثال: React, TypeScript, Node.js"
                className="w-full bg-gray border border-border text-text text-sm rounded-lg px-4 py-2.5 input-neon placeholder-text-secondary/40 transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-text-secondary mb-1.5">حالة المشروع</label>
              <select
                value={form.status}
                onChange={e => updateField('status', e.target.value as Project['status'])}
                className="w-full bg-gray border border-border text-text text-sm rounded-lg px-4 py-2.5 input-neon transition-all cursor-pointer focus:outline-none"
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">رابط GitHub</label>
              <input
                type="url"
                value={form.github_url}
                onChange={e => updateField('github_url', e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-gray border border-border text-text text-sm rounded-lg px-4 py-2.5 input-neon placeholder-text-secondary/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">رابط المشروع المباشر</label>
              <input
                type="url"
                value={form.live_url}
                onChange={e => updateField('live_url', e.target.value)}
                placeholder="https://..."
                className="w-full bg-gray border border-border text-text text-sm rounded-lg px-4 py-2.5 input-neon placeholder-text-secondary/40 transition-all"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={submitProject}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-arabic hover:bg-accent/15 hover:shadow-glow disabled:opacity-50 transition-all"
            >
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الحفظ...</>
                : <><PlusCircle className="w-4 h-4" /> إضافة المشروع</>}
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

export default Projects;
