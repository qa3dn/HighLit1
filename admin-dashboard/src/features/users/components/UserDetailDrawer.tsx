import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Building2, Wrench, Activity, BadgeCheck } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loader } from '../../../components/ui/Loader';
import { StatCard } from '../../../components/ui/StatCard';
import type {
  UserAdminDetail,
  UserAdminDetailUser,
  UserCompany,
  UserMembership,
  UserProfilePatch,
  UserRole,
} from '../userService';
import { COMPANY_SIZES, type CompanyPatch } from '../../companies/companyService';
import {
  useAdjustReputation,
  useApproveCompany,
  useChangeUserRole,
  useRejectCompany,
  useSetUserPassword,
  useToggleUserBan,
  useUpdateCompany,
  useUpdateUserProfile,
  useUserAdminDetail,
  useVerifyCompany,
} from '../useUserDetail';

const ROLES: UserRole[] = ['USER', 'ADMIN', 'COMPANY'];

const roleVariant: Record<UserRole, 'success' | 'info' | 'warning'> = {
  ADMIN: 'success',
  COMPANY: 'info',
  USER: 'warning',
};

const statusVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
  if (status === 'APPROVED') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'REJECTED') return 'danger';
  return 'default';
};

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(iso));
const fmtDateTime = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) : '—';

function errorMessage(e: unknown, fallback = 'حدث خطأ. حاول مرة أخرى.'): string {
  const detail = (e as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map(String).join(' ');
  if (typeof detail === 'string') return detail;
  return fallback;
}

type TabKey = 'overview' | 'companies' | 'actions' | 'activity';
const TABS: { key: TabKey; label: string; icon: typeof User }[] = [
  { key: 'overview', label: 'نظرة عامة', icon: User },
  { key: 'companies', label: 'الشركات', icon: Building2 },
  { key: 'actions', label: 'إجراءات', icon: Wrench },
  { key: 'activity', label: 'النشاط', icon: Activity },
];

// ── Drawer shell ────────────────────────────────────────────────────────────

interface DrawerProps {
  userId: number | null;
  onClose: () => void;
}

export const UserDetailDrawer = ({ userId, onClose }: DrawerProps) => {
  if (userId == null) return null;
  return createPortal(<DrawerBody userId={userId} onClose={onClose} />, document.body);
};

const DrawerBody = ({ userId, onClose }: { userId: number; onClose: () => void }) => {
  const { data, isLoading, isError } = useUserAdminDetail(userId);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-md" onClick={onClose} />
      <aside
        dir="rtl"
        className="absolute inset-y-0 left-0 flex w-full max-w-xl flex-col border-r border-border bg-gray shadow-large animate-fade-in"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-text">تفاصيل المستخدم</h2>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-gray-light hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8">
            <Loader />
          </div>
        ) : isError || !data ? (
          <p className="p-8 text-red-400">تعذّر تحميل تفاصيل المستخدم.</p>
        ) : (
          <DrawerInner userId={userId} detail={data} />
        )}
      </aside>
    </div>
  );
};

const DrawerInner = ({ userId, detail }: { userId: number; detail: UserAdminDetail }) => {
  const [tab, setTab] = useState<TabKey>('overview');
  const u = detail.user;
  const initial = (u.username || u.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Profile header */}
      <div className="flex items-start gap-4 border-b border-border p-5">
        {u.avatar_url ? (
          <img
            src={u.avatar_url}
            alt={u.username}
            className="h-14 w-14 shrink-0 rounded-2xl border border-border object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-xl font-bold text-accent">
            {initial}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-text">{u.username}</h3>
            <Badge variant={roleVariant[u.role]}>{u.role}</Badge>
            <Badge variant={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'نشط' : 'محظور'}</Badge>
          </div>
          <p className="truncate text-sm text-text-secondary">{u.email}</p>
          <p className="mt-0.5 text-xs text-text-secondary">عضو منذ {fmtDate(u.date_joined)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-3">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {tab === 'overview' && <OverviewTab detail={detail} />}
        {tab === 'companies' && (
          <CompaniesTab userId={userId} companies={detail.companies} memberships={detail.memberships} />
        )}
        {tab === 'actions' && <ActionsTab userId={userId} user={u} />}
        {tab === 'activity' && <ActivityTab events={detail.recent_activity} />}
      </div>
    </div>
  );
};

// ── Overview ────────────────────────────────────────────────────────────────

const Field = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
    <span className="text-text-secondary">{label}</span>
    <span className="text-left text-text">{value || '—'}</span>
  </div>
);

const OverviewTab = ({ detail }: { detail: UserAdminDetail }) => {
  const { user: u, stats } = detail;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="المنشورات" value={stats.posts} />
        <StatCard label="التعليقات" value={stats.comments} />
        <StatCard label="المشاريع" value={stats.projects} />
        <StatCard label="الوظائف المنشأة" value={stats.jobs_created} />
        <StatCard label="الطلبات" value={stats.applications} />
        <StatCard label="السمعة" value={stats.reputation_points} accent />
      </div>

      <div className="rounded-xl border border-border bg-gray-light p-4">
        <h4 className="mb-2 text-sm font-semibold text-text-secondary">الملف الشخصي</h4>
        <Field label="الرتبة" value={u.rank} />
        <Field label="الجامعة" value={u.university} />
        <Field label="التخصص" value={u.major} />
        <Field label="GitHub" value={u.github_username} />
        <Field label="الحالة" value={u.status_text} />
        <Field label="النبذة" value={u.bio} />
        <Field label="الظهور" value={u.profile_visibility === 'PUBLIC' ? 'عام' : 'خاص'} />
        <Field label="تاريخ الانضمام" value={fmtDate(u.date_joined)} />
        <Field label="آخر دخول" value={fmtDateTime(u.last_login)} />
      </div>
    </div>
  );
};

// ── Companies ────────────────────────────────────────────────────────────────

const CompaniesTab = ({
  userId,
  companies,
  memberships,
}: {
  userId: number;
  companies: UserAdminDetail['companies'];
  memberships: UserMembership[];
}) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">الإجمالي: {companies.total}</Badge>
        <Badge variant="warning">قيد المراجعة: {companies.counts.PENDING}</Badge>
        <Badge variant="success">معتمدة: {companies.counts.APPROVED}</Badge>
        <Badge variant="danger">مرفوضة: {companies.counts.REJECTED}</Badge>
      </div>

      {companies.items.length === 0 ? (
        <p className="rounded-xl border border-border bg-gray-light p-6 text-center text-sm text-text-secondary">
          لا يملك هذا المستخدم أي شركة.
        </p>
      ) : (
        companies.items.map((c) => <CompanyCard key={c.id} userId={userId} company={c} />)
      )}

      {memberships.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-text-secondary">عضويات في شركات أخرى</h4>
          <div className="space-y-2">
            {memberships.map((m) => (
              <div
                key={m.company_id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-gray-light px-4 py-2 text-sm"
              >
                <span className="truncate text-text">{m.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
                  <Badge variant="default">{m.role}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CompanyCard = ({ userId, company }: { userId: number; company: UserCompany }) => {
  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [form, setForm] = useState<CompanyPatch>({});

  const verify = useVerifyCompany(userId);
  const approve = useApproveCompany(userId);
  const reject = useRejectCompany(userId);
  const update = useUpdateCompany(userId);
  const busy = verify.isPending || approve.isPending || reject.isPending || update.isPending;

  const startEdit = () => {
    setForm({
      name: company.name,
      tagline: company.tagline,
      industry: company.industry,
      size: company.size,
      location: company.location,
      website: company.website,
      about: company.about,
    });
    setEditing(true);
  };

  const submitEdit = async () => {
    await update.mutateAsync({ slug: company.slug, patch: form });
    setEditing(false);
  };

  const submitReject = async () => {
    if (!note.trim()) return;
    await reject.mutateAsync({ slug: company.slug, note: note.trim() });
    setRejecting(false);
    setNote('');
  };

  return (
    <div className="rounded-xl border border-border bg-gray-light p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-text">{company.name}</p>
          <p className="text-xs text-text-secondary">/{company.slug}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {company.is_verified && (
            <span className="flex items-center gap-1 text-xs text-accent">
              <BadgeCheck className="h-4 w-4" /> موثّقة
            </span>
          )}
          <Badge variant={statusVariant(company.status)}>{company.status}</Badge>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-secondary">
        <span>الوظائف: {company.job_count}</span>
        <span>المتابعون: {company.follower_count}</span>
        <span>أُنشئت: {fmtDate(company.created_at)}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {company.status === 'PENDING' && (
          <>
            <Button
              size="sm"
              disabled={busy}
              onClick={() => approve.mutate({ slug: company.slug })}
            >
              اعتماد
            </Button>
            <Button size="sm" variant="danger" disabled={busy} onClick={() => setRejecting((v) => !v)}>
              رفض
            </Button>
          </>
        )}
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => verify.mutate({ slug: company.slug, isVerified: !company.is_verified })}
        >
          {company.is_verified ? 'إلغاء التوثيق' : 'توثيق'}
        </Button>
        <Button size="sm" variant="ghost" disabled={busy} onClick={editing ? () => setEditing(false) : startEdit}>
          {editing ? 'إلغاء التعديل' : 'تعديل'}
        </Button>
      </div>

      {rejecting && (
        <div className="mt-3 space-y-2">
          <Input placeholder="سبب الرفض" value={note} onChange={(e) => setNote(e.target.value)} />
          <Button size="sm" variant="danger" disabled={reject.isPending || !note.trim()} onClick={submitReject}>
            تأكيد الرفض
          </Button>
        </div>
      )}

      {editing && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <Input
            label="الاسم"
            value={form.name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="المجال"
            value={form.industry ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">الحجم</label>
            <select
              value={form.size ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
              className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
            >
              <option value="">—</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="الموقع"
            value={form.location ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <Input
            label="الرابط"
            value={form.website ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">نبذة</label>
            <textarea
              value={form.about ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
              rows={3}
              className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>
          {update.isError && <p className="text-sm text-red-400">{errorMessage(update.error)}</p>}
          <Button size="sm" disabled={update.isPending} onClick={submitEdit}>
            {update.isPending ? '...جارٍ الحفظ' : 'حفظ'}
          </Button>
        </div>
      )}
    </div>
  );
};

// ── Actions ──────────────────────────────────────────────────────────────────

const ActionsTab = ({ userId, user }: { userId: number; user: UserAdminDetailUser }) => {
  const changeRole = useChangeUserRole(userId);
  const toggleBan = useToggleUserBan(userId);
  const adjustRep = useAdjustReputation(userId);
  const setPassword = useSetUserPassword(userId);
  const updateProfile = useUpdateUserProfile(userId);

  const [points, setPoints] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwDone, setPwDone] = useState(false);
  const [profile, setProfile] = useState<UserProfilePatch>({
    bio: user.bio,
    university: user.university,
    major: user.major,
    github_username: user.github_username,
    status_text: user.status_text,
    profile_visibility: user.profile_visibility,
    show_posts: user.show_posts,
    show_code: user.show_code,
    show_ideas: user.show_ideas,
    show_activity: user.show_activity,
  });

  const pwMismatch = pw.length > 0 && pw !== pw2;
  const pwTooShort = pw.length > 0 && pw.length < 8;
  const submitPassword = async () => {
    setPwDone(false);
    await setPassword.mutateAsync(pw);
    setPw('');
    setPw2('');
    setPwDone(true);
  };

  return (
    <div className="space-y-5">
      {/* Role */}
      <section className="rounded-xl border border-border bg-gray-light p-4">
        <h4 className="mb-2 text-sm font-semibold text-text-secondary">الدور</h4>
        <select
          value={user.role}
          disabled={changeRole.isPending}
          onChange={(e) => changeRole.mutate(e.target.value as UserRole)}
          className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </section>

      {/* Ban */}
      <section className="rounded-xl border border-border bg-gray-light p-4">
        <h4 className="mb-2 text-sm font-semibold text-text-secondary">حالة الحساب</h4>
        <Button
          variant={user.is_active ? 'danger' : 'primary'}
          size="sm"
          disabled={toggleBan.isPending}
          onClick={() => toggleBan.mutate(!user.is_active)}
        >
          {user.is_active ? 'حظر الحساب' : 'رفع الحظر'}
        </Button>
      </section>

      {/* Reputation */}
      <section className="rounded-xl border border-border bg-gray-light p-4">
        <h4 className="mb-1 text-sm font-semibold text-text-secondary">تعديل السمعة</h4>
        <p className="mb-2 text-xs text-text-secondary">
          الحالية: {user.reputation_points} — الحد الأقصى ±100 لكل عملية.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="±نقاط"
            className="w-28 rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
          <Button
            size="sm"
            variant="secondary"
            disabled={adjustRep.isPending || points === ''}
            onClick={() => {
              adjustRep.mutate(Number(points));
              setPoints('');
            }}
          >
            تطبيق
          </Button>
        </div>
      </section>

      {/* Set password */}
      <section className="rounded-xl border border-border bg-gray-light p-4">
        <h4 className="mb-2 text-sm font-semibold text-text-secondary">كلمة مرور مؤقتة</h4>
        {user.role === 'ADMIN' ? (
          <p className="text-xs text-text-secondary">غير متاح لحسابات المدراء.</p>
        ) : (
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="كلمة المرور الجديدة"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setPwDone(false);
              }}
              error={pwTooShort ? 'يجب ألا تقل عن 8 أحرف.' : undefined}
            />
            <Input
              type="password"
              placeholder="تأكيد كلمة المرور"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              error={pwMismatch ? 'كلمتا المرور غير متطابقتين.' : undefined}
            />
            {setPassword.isError && <p className="text-sm text-red-400">{errorMessage(setPassword.error)}</p>}
            {pwDone && <p className="text-sm text-accent">تم تعيين كلمة المرور بنجاح.</p>}
            <Button
              size="sm"
              disabled={setPassword.isPending || pw.length < 8 || pwMismatch}
              onClick={submitPassword}
            >
              {setPassword.isPending ? '...جارٍ' : 'تعيين'}
            </Button>
          </div>
        )}
      </section>

      {/* Edit profile */}
      <section className="rounded-xl border border-border bg-gray-light p-4">
        <h4 className="mb-3 text-sm font-semibold text-text-secondary">تعديل الملف الشخصي</h4>
        <div className="space-y-2">
          <Input
            label="الجامعة"
            value={profile.university ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, university: e.target.value }))}
          />
          <Input
            label="التخصص"
            value={profile.major ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, major: e.target.value }))}
          />
          <Input
            label="GitHub"
            value={profile.github_username ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, github_username: e.target.value }))}
          />
          <Input
            label="الحالة"
            value={profile.status_text ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, status_text: e.target.value }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">النبذة</label>
            <textarea
              value={profile.bio ?? ''}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
              className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">الظهور</label>
            <select
              value={profile.profile_visibility ?? 'PUBLIC'}
              onChange={(e) =>
                setProfile((p) => ({ ...p, profile_visibility: e.target.value as 'PUBLIC' | 'PRIVATE' }))
              }
              className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
            >
              <option value="PUBLIC">عام</option>
              <option value="PRIVATE">خاص</option>
            </select>
          </div>
          {updateProfile.isError && <p className="text-sm text-red-400">{errorMessage(updateProfile.error)}</p>}
          {updateProfile.isSuccess && <p className="text-sm text-accent">تم حفظ التعديلات.</p>}
          <Button size="sm" disabled={updateProfile.isPending} onClick={() => updateProfile.mutate(profile)}>
            {updateProfile.isPending ? '...جارٍ الحفظ' : 'حفظ التعديلات'}
          </Button>
        </div>
      </section>
    </div>
  );
};

// ── Activity ──────────────────────────────────────────────────────────────────

const ActivityTab = ({ events }: { events: UserAdminDetail['recent_activity'] }) => {
  if (events.length === 0) {
    return <p className="text-center text-sm text-text-secondary">لا يوجد نشاط مسجّل.</p>;
  }
  return (
    <ul className="space-y-2">
      {events.map((e) => (
        <li key={e.id} className="rounded-lg border border-border bg-gray-light px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-accent">{e.action}</span>
            <span className="text-xs text-text-secondary">{fmtDateTime(e.created_at)}</span>
          </div>
          {e.target_type && (
            <p className="mt-1 text-xs text-text-secondary">
              {e.target_type}#{e.target_id}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};
