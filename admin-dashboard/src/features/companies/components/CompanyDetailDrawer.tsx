import { useState, type ReactNode } from 'react';
import { Building2, Users, BarChart3, Wrench, BadgeCheck } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loader } from '../../../components/ui/Loader';
import { StatCard } from '../../../components/ui/StatCard';
import { Drawer } from '../../../components/ui/Drawer';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import { COMPANY_SIZES, type CompanyDetail, type CompanyPatch } from '../companyService';
import {
  useApproveCompanyDetail,
  useCompanyAnalytics,
  useCompanyDetail,
  useRejectCompanyDetail,
  useUpdateCompanyDetail,
  useVerifyCompanyDetail,
} from '../useCompanyDetail';

const STATUS_LABEL: Record<string, string> = { PENDING: 'قيد المراجعة', APPROVED: 'معتمدة', REJECTED: 'مرفوضة' };
const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};
const ROLE_LABEL: Record<string, string> = { OWNER: 'مالك', ADMIN: 'مدير', EMPLOYEE: 'موظف' };

const fmtDate = (iso: string) => new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(iso));

function errorMessage(e: unknown, fallback = 'حدث خطأ. حاول مرة أخرى.'): string {
  const detail = (e as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map(String).join(' ');
  if (typeof detail === 'string') return detail;
  return fallback;
}

type TabKey = 'overview' | 'members' | 'analytics' | 'actions';
const TABS: TabItem<TabKey>[] = [
  { key: 'overview', label: 'نظرة عامة', icon: Building2 },
  { key: 'members', label: 'الأعضاء', icon: Users },
  { key: 'analytics', label: 'التحليلات', icon: BarChart3 },
  { key: 'actions', label: 'إجراءات', icon: Wrench },
];

interface DrawerProps {
  slug: string | null;
  onClose: () => void;
}

export const CompanyDetailDrawer = ({ slug, onClose }: DrawerProps) => (
  <Drawer open={slug != null} onClose={onClose} title="تفاصيل الشركة">
    {slug != null && <DrawerBody slug={slug} />}
  </Drawer>
);

const DrawerBody = ({ slug }: { slug: string }) => {
  const { data, isLoading, isError } = useCompanyDetail(slug);
  if (isLoading) return <div className="p-8"><Loader /></div>;
  if (isError || !data) return <p className="p-8 text-red-400">تعذّر تحميل تفاصيل الشركة.</p>;
  return <DrawerInner slug={slug} company={data} />;
};

const Field = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
    <span className="text-text-secondary">{label}</span>
    <span className="text-left text-text">{value || '—'}</span>
  </div>
);

const DrawerInner = ({ slug, company }: { slug: string; company: CompanyDetail }) => {
  const [tab, setTab] = useState<TabKey>('overview');
  const initial = (company.name || 'C').charAt(0).toUpperCase();

  return (
    <div>
      <div className="flex items-start gap-4 border-b border-border p-5">
        {company.logo_url ? (
          <img src={company.logo_url} alt={company.name} className="h-14 w-14 shrink-0 rounded-2xl border border-border object-cover" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-xl font-bold text-accent">
            {initial}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-text">{company.name}</h3>
            <Badge variant={STATUS_VARIANT[company.status] ?? 'default'}>
              {STATUS_LABEL[company.status] ?? company.status}
            </Badge>
            {company.is_verified && (
              <span className="flex items-center gap-1 text-xs text-accent">
                <BadgeCheck className="h-4 w-4" /> موثّقة
              </span>
            )}
          </div>
          {company.tagline && <p className="truncate text-sm text-text-secondary">{company.tagline}</p>}
          <p className="mt-0.5 text-xs text-text-secondary">/{company.slug}</p>
        </div>
      </div>

      <div className="px-3">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      <div className="p-5">
        {tab === 'overview' && <OverviewTab company={company} />}
        {tab === 'members' && <MembersTab company={company} />}
        {tab === 'analytics' && <AnalyticsTab slug={slug} />}
        {tab === 'actions' && <ActionsTab slug={slug} company={company} />}
      </div>
    </div>
  );
};

const OverviewTab = ({ company }: { company: CompanyDetail }) => (
  <div className="rounded-xl border border-border bg-gray-light p-4">
    <Field label="المجال" value={company.industry} />
    <Field label="الحجم" value={company.size} />
    <Field label="الموقع" value={company.location} />
    <Field label="الرابط" value={company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{company.website}</a> : '—'} />
    <Field label="سنة التأسيس" value={company.founded_year ?? '—'} />
    <Field label="النبذة" value={company.about} />
    <Field label="المتابعون" value={company.follower_count} />
    <Field label="مالك (id)" value={company.owner_id} />
    {company.review_note && <Field label="ملاحظة المراجعة" value={company.review_note} />}
    <Field label="أُنشئت" value={fmtDate(company.created_at)} />
  </div>
);

const MembersTab = ({ company }: { company: CompanyDetail }) => {
  const members = company.members ?? [];
  if (members.length === 0) {
    return <p className="rounded-xl border border-border bg-gray-light p-6 text-center text-sm text-text-secondary">لا يوجد أعضاء.</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-xs text-text-secondary">{members.length} عضو</p>
      {members.map((m) => (
        <div key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-gray-light px-4 py-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 border border-accent/20 text-sm font-bold text-accent">
              {(m.username || '؟').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-text">{m.username}</p>
              {m.title && <p className="truncate text-xs text-text-secondary">{m.title}</p>}
            </div>
          </div>
          <Badge variant={m.role === 'OWNER' ? 'success' : m.role === 'ADMIN' ? 'info' : 'default'}>
            {ROLE_LABEL[m.role] ?? m.role}
          </Badge>
        </div>
      ))}
    </div>
  );
};

const AnalyticsTab = ({ slug }: { slug: string }) => {
  const { data, isLoading, isError } = useCompanyAnalytics(slug);
  if (isLoading) return <Loader />;
  if (isError || !data) return <p className="text-sm text-text-secondary">تعذّر تحميل التحليلات.</p>;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <StatCard label="المتابعون" value={data.followers} accent />
      <StatCard label="الأعضاء" value={data.members} />
      <StatCard label="المنشورات" value={data.posts} />
      <StatCard label="الوظائف" value={data.jobs} />
      <StatCard label="الوسائط" value={data.media} />
    </div>
  );
};

const ActionsTab = ({ slug, company }: { slug: string; company: CompanyDetail }) => {
  const approve = useApproveCompanyDetail(slug);
  const reject = useRejectCompanyDetail(slug);
  const verify = useVerifyCompanyDetail(slug);
  const update = useUpdateCompanyDetail(slug);

  const [rejectNote, setRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [form, setForm] = useState<CompanyPatch>({
    name: company.name,
    tagline: company.tagline,
    about: company.about,
    industry: company.industry,
    size: company.size,
    location: company.location,
    website: company.website,
  });

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-gray-light p-4">
        <h4 className="mb-3 text-sm font-semibold text-text-secondary">المراجعة والتوثيق</h4>
        <div className="flex flex-wrap gap-2">
          {company.status !== 'APPROVED' && (
            <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate(undefined)}>
              اعتماد
            </Button>
          )}
          {company.status !== 'REJECTED' && (
            <Button size="sm" variant="danger" disabled={reject.isPending} onClick={() => setRejecting((v) => !v)}>
              رفض
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            disabled={verify.isPending}
            onClick={() => verify.mutate(!company.is_verified)}
          >
            {company.is_verified ? 'إلغاء التوثيق' : 'توثيق'}
          </Button>
        </div>
        {rejecting && (
          <div className="mt-3 space-y-2">
            <Input placeholder="سبب الرفض" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
            <Button
              size="sm"
              variant="danger"
              disabled={reject.isPending || !rejectNote.trim()}
              onClick={async () => {
                await reject.mutateAsync(rejectNote.trim());
                setRejecting(false);
                setRejectNote('');
              }}
            >
              تأكيد الرفض
            </Button>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-gray-light p-4">
        <h4 className="mb-3 text-sm font-semibold text-text-secondary">تعديل بيانات الشركة</h4>
        <div className="space-y-2">
          <Input label="الاسم" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="الشعار النصي" value={form.tagline ?? ''} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} />
          <Input label="المجال" value={form.industry ?? ''} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">الحجم</label>
            <select
              value={form.size ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
              className="rounded-md border border-border bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
            >
              <option value="">—</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <Input label="الموقع" value={form.location ?? ''} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <Input label="الرابط" value={form.website ?? ''} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
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
          {update.isSuccess && <p className="text-sm text-accent">تم حفظ التعديلات.</p>}
          <Button size="sm" disabled={update.isPending} onClick={() => update.mutate(form)}>
            {update.isPending ? '...جارٍ الحفظ' : 'حفظ التعديلات'}
          </Button>
        </div>
      </section>
    </div>
  );
};
