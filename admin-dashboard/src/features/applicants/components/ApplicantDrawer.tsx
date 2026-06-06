import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Globe,
  FileText,
  GraduationCap,
  Briefcase,
  Sparkles,
  Check,
} from 'lucide-react';
import { Drawer } from '../../../components/ui/Drawer';
import { Badge } from '../../../components/ui/Badge';
import type { Applicant, ApplicationStatus } from '../applicantsService';

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: 'قيد المراجعة',
  REVIEWED: 'تمت المراجعة',
  SHORTLISTED: 'القائمة المختصرة',
  ACCEPTED: 'مقبول',
  REJECTED: 'مرفوض',
};
const PIPELINE: ApplicationStatus[] = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));

function matchVariant(pct: number): 'success' | 'warning' | 'default' {
  if (pct >= 75) return 'success';
  if (pct >= 40) return 'warning';
  return 'default';
}

function ContactLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:border-accent/50 hover:text-accent"
      dir="ltr"
    >
      {icon}
      {label}
    </a>
  );
}

export function ApplicantDrawer({
  applicant,
  open,
  onClose,
  onStatus,
}: {
  applicant: Applicant | null;
  open: boolean;
  onClose: () => void;
  onStatus: (id: number, status: ApplicationStatus) => void;
}) {
  if (!applicant) return null;
  const a = applicant;
  const u = a.applicant;
  const name = a.full_name || u.username;
  const contactEmail = a.email || u.email || '';

  return (
    <Drawer open={open} onClose={onClose} title="ملف المتقدّم">
      <div className="space-y-6 text-text" dir="rtl">
        {/* Identity */}
        <div className="flex items-start gap-4">
          {a.photo_url || u.avatar_url ? (
            <img src={a.photo_url || u.avatar_url} alt={name} className="h-16 w-16 shrink-0 rounded-full border border-border object-cover" />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-xl font-bold text-accent">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold">{name}</h3>
            <p className="text-sm text-text-secondary">@{u.username}</p>
            {a.headline && <p className="mt-0.5 text-sm">{a.headline}</p>}
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-secondary">
              {a.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {a.location}
                </span>
              )}
              {(u.major || u.university) && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" /> {[u.major, u.university].filter(Boolean).join(' — ')}
                </span>
              )}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={a.status === 'ACCEPTED' ? 'success' : a.status === 'REJECTED' ? 'danger' : 'info'}>
                {STATUS_LABEL[a.status]}
              </Badge>
              {a.skill_match !== null && (
                <Badge variant={matchVariant(a.skill_match)}>مطابقة {a.skill_match}%</Badge>
              )}
              <span className="text-xs text-text-secondary">تقدّم في {fmtDate(a.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">التواصل</h4>
          <div className="flex flex-wrap gap-2">
            {contactEmail && (
              <ContactLink href={`mailto:${contactEmail}`} icon={<Mail className="h-4 w-4" />} label={contactEmail} />
            )}
            {a.phone && <ContactLink href={`tel:${a.phone}`} icon={<Phone className="h-4 w-4" />} label={a.phone} />}
            {u.github_username && (
              <ContactLink href={`https://github.com/${u.github_username}`} icon={<ExternalLink className="h-4 w-4" />} label={`GitHub: ${u.github_username}`} />
            )}
            {a.linkedin_url && <ContactLink href={a.linkedin_url} icon={<ExternalLink className="h-4 w-4" />} label="LinkedIn" />}
            {a.portfolio_url && <ContactLink href={a.portfolio_url} icon={<Globe className="h-4 w-4" />} label="الأعمال" />}
            {a.resume_url && (
              <a
                href={a.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/20"
              >
                <FileText className="h-4 w-4" /> عرض السيرة الذاتية
              </a>
            )}
          </div>
        </section>

        {/* Skills */}
        {(a.skills.length > 0 || a.missing_skills.length > 0) && (
          <section>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <Sparkles className="h-3.5 w-3.5" /> المهارات
            </h4>
            <div className="flex flex-wrap gap-2">
              {a.matched_skills.map((s) => (
                <span key={`m-${s}`} className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs text-accent">
                  <Check className="h-3 w-3" /> {s}
                </span>
              ))}
              {a.skills
                .filter((s) => !a.matched_skills.some((m) => m.toLowerCase() === s.toLowerCase()))
                .map((s) => (
                  <span key={`s-${s}`} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-secondary">
                    {s}
                  </span>
                ))}
              {a.missing_skills.map((s) => (
                <span key={`x-${s}`} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-secondary line-through opacity-50">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {a.experience.length > 0 && (
          <section>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <Briefcase className="h-3.5 w-3.5" /> الخبرات
            </h4>
            <ol className="space-y-3 border-r border-border pr-4">
              {a.experience.map((x, i) => (
                <li key={i} className="relative">
                  <span className="absolute -right-[21px] top-1.5 h-2 w-2 rounded-full bg-accent" />
                  <p className="text-sm font-semibold">
                    {x.title || 'دور'}
                    {x.company && <span className="font-normal text-text-secondary"> · {x.company}</span>}
                  </p>
                  {(x.start || x.end) && (
                    <p className="text-[11px] text-text-secondary" dir="ltr">
                      {[x.start, x.end].filter(Boolean).join(' — ')}
                    </p>
                  )}
                  {x.description && <p className="mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-text-secondary">{x.description}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Education */}
        {a.education.length > 0 && (
          <section>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <GraduationCap className="h-3.5 w-3.5" /> التعليم
            </h4>
            <ol className="space-y-3 border-r border-border pr-4">
              {a.education.map((e, i) => (
                <li key={i} className="relative">
                  <span className="absolute -right-[21px] top-1.5 h-2 w-2 rounded-full bg-accent" />
                  <p className="text-sm font-semibold">{[e.degree, e.field].filter(Boolean).join(' — ') || 'مؤهل'}</p>
                  {e.institution && <p className="text-xs text-text-secondary">{e.institution}</p>}
                  {(e.start_year || e.end_year) && (
                    <p className="text-[11px] text-text-secondary" dir="ltr">
                      {[e.start_year, e.end_year].filter(Boolean).join(' — ')}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Cover letter */}
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">خطاب التقديم</h4>
          {a.cover_letter ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{a.cover_letter}</p>
          ) : (
            <p className="text-sm text-text-secondary">لم يرفق المتقدّم خطاباً.</p>
          )}
        </section>

        {/* Pipeline */}
        <section className="border-t border-border pt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">تحديث الحالة</h4>
          <div className="flex flex-wrap gap-2">
            {PIPELINE.map((s) => {
              const active = a.status === s;
              return (
                <button
                  key={s}
                  onClick={() => !active && onStatus(a.id, s)}
                  disabled={active}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-text-secondary hover:border-accent/50 hover:text-accent'
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </Drawer>
  );
}
