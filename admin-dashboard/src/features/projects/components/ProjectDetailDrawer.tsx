import { useState, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Info, FileText, Layers, Wrench } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { StatCard } from '../../../components/ui/StatCard';
import { Drawer } from '../../../components/ui/Drawer';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import {
  approveProject,
  hideProject,
  rejectProject,
  type StudentProject,
} from '../../../services/studentProjects';

const STATUS_LABEL: Record<string, string> = { PUBLISHED: 'منشور', HIDDEN: 'مخفي', REJECTED: 'مرفوض' };
const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PUBLISHED: 'success',
  HIDDEN: 'warning',
  REJECTED: 'danger',
};

const fmtDate = (iso: string) => new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(iso));

function errorMessage(e: unknown, fallback = 'حدث خطأ. حاول مرة أخرى.'): string {
  const detail = (e as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map(String).join(' ');
  if (typeof detail === 'string') return detail;
  return fallback;
}

type TabKey = 'overview' | 'content' | 'details' | 'actions';
const TABS: TabItem<TabKey>[] = [
  { key: 'overview', label: 'نظرة عامة', icon: Info },
  { key: 'content', label: 'المحتوى', icon: FileText },
  { key: 'details', label: 'البيانات', icon: Layers },
  { key: 'actions', label: 'إجراءات', icon: Wrench },
];

export const ProjectDetailDrawer = ({
  project,
  onClose,
}: {
  project: StudentProject | null;
  onClose: () => void;
}) => (
  <Drawer open={project != null} onClose={onClose} title="تفاصيل المشروع">
    {project != null && <DrawerBody key={project.id} initial={project} />}
  </Drawer>
);

const Field = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
    <span className="text-text-secondary">{label}</span>
    <span className="text-left text-text">{value || '—'}</span>
  </div>
);

const Chips = ({ items }: { items: string[] }) =>
  items.length === 0 ? (
    <span className="text-sm text-text-secondary">—</span>
  ) : (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className="rounded-full border border-border bg-gray px-2 py-0.5 text-xs text-text-secondary">
          {t}
        </span>
      ))}
    </div>
  );

const DrawerBody = ({ initial }: { initial: StudentProject }) => {
  const [p, setP] = useState(initial);
  const [tab, setTab] = useState<TabKey>('overview');
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-projects'] });

  const approve = useMutation({ mutationFn: () => approveProject(p.id), onSuccess: (d) => { setP(d); invalidate(); } });
  const hide = useMutation({ mutationFn: () => hideProject(p.id), onSuccess: (d) => { setP(d); invalidate(); } });
  const reject = useMutation({
    mutationFn: (reason: string) => rejectProject(p.id, reason),
    onSuccess: (d) => {
      setP(d);
      setRejecting(false);
      setRejectReason('');
      invalidate();
    },
  });
  const busy = approve.isPending || hide.isPending || reject.isPending;

  return (
    <div>
      <div className="flex items-start gap-4 border-b border-border p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-text">{p.title}</h3>
            <Badge variant={STATUS_VARIANT[p.status] ?? 'default'}>{STATUS_LABEL[p.status] ?? p.status}</Badge>
          </div>
          <p className="truncate text-sm text-text-secondary">{p.author?.username} · {p.university}</p>
        </div>
      </div>

      <div className="px-3">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      <div className="p-5">
        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="المشاهدات" value={p.view_count} accent />
              <StatCard label="النوع" value={p.project_type} />
            </div>
            <div className="rounded-xl border border-border bg-gray-light p-4">
              <Field label="الطالب" value={p.author?.username} />
              <Field label="الجامعة" value={p.university} />
              <Field label="التخصص" value={p.major} />
              <Field label="GitHub" value={p.github_url ? <a className="text-accent hover:underline" href={p.github_url} target="_blank" rel="noopener noreferrer">رابط</a> : '—'} />
              <Field label="عرض حي" value={p.demo_url ? <a className="text-accent hover:underline" href={p.demo_url} target="_blank" rel="noopener noreferrer">رابط</a> : '—'} />
              <Field label="فيديو" value={p.video_url ? <a className="text-accent hover:underline" href={p.video_url} target="_blank" rel="noopener noreferrer">رابط</a> : '—'} />
              {p.rejection_reason && <Field label="سبب الرفض" value={p.rejection_reason} />}
              <Field label="أُنشئ" value={fmtDate(p.created_at)} />
            </div>
          </div>
        )}

        {tab === 'content' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-gray-light p-4">
              <h4 className="mb-1 text-sm font-semibold text-text-secondary">الملخّص</h4>
              <p className="text-sm text-text">{p.summary || '—'}</p>
            </div>
            <div className="rounded-xl border border-border bg-gray-light p-4">
              <h4 className="mb-1 text-sm font-semibold text-text-secondary">الوصف</h4>
              <p className="whitespace-pre-wrap text-sm text-text">{p.description || '—'}</p>
            </div>
          </div>
        )}

        {tab === 'details' && (
          <div className="rounded-xl border border-border bg-gray-light p-4 space-y-3">
            <Field label="السنة الأكاديمية" value={p.academic_year} />
            <div>
              <p className="mb-1 text-sm text-text-secondary">التقنيات</p>
              <Chips items={p.tech_stack ?? []} />
            </div>
            <div>
              <p className="mb-1 text-sm text-text-secondary">الوسوم</p>
              <Chips items={p.tags ?? []} />
            </div>
          </div>
        )}

        {tab === 'actions' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {p.status !== 'PUBLISHED' && (
                <Button size="sm" disabled={busy} onClick={() => approve.mutate()}>
                  إعادة للنشر
                </Button>
              )}
              {p.status === 'PUBLISHED' && (
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => hide.mutate()}>
                  إخفاء
                </Button>
              )}
              {p.status !== 'REJECTED' && (
                <Button size="sm" variant="danger" disabled={busy} onClick={() => setRejecting((v) => !v)}>
                  رفض
                </Button>
              )}
            </div>
            {rejecting && (
              <div className="space-y-2">
                <Input placeholder="سبب الرفض (اختياري)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                <Button size="sm" variant="danger" disabled={reject.isPending} onClick={() => reject.mutate(rejectReason)}>
                  تأكيد الرفض
                </Button>
              </div>
            )}
            {(approve.isError || hide.isError || reject.isError) && (
              <p className="text-sm text-red-400">{errorMessage(approve.error || hide.error || reject.error)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
