import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import {
  useApprovePost,
  useDeleteComment,
  useDeletePost,
  useRejectPost,
  useSetCommentHidden,
  useSetPostHidden,
} from '../useModeration';
import type { ModComment, ModPost } from '../moderationService';

export type SelectedContent =
  | { type: 'post'; item: ModPost }
  | { type: 'comment'; item: ModComment };

const TYPE_LABEL: Record<string, string> = { RANT: 'فضفضة', CODE: 'كود' };

const fmtDateTime = (iso: string) =>
  new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

export const ContentDetailDrawer = ({
  selected,
  onClose,
}: {
  selected: SelectedContent | null;
  onClose: () => void;
}) => (
  <Drawer
    open={selected != null}
    onClose={onClose}
    title={selected?.type === 'comment' ? 'تفاصيل التعليق' : 'تفاصيل المنشور'}
  >
    {selected?.type === 'post' && <PostBody key={`p${selected.item.id}`} initial={selected.item} onClose={onClose} />}
    {selected?.type === 'comment' && (
      <CommentBody key={`c${selected.item.id}`} initial={selected.item} onClose={onClose} />
    )}
  </Drawer>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-gray-light p-4">
    <h4 className="mb-2 text-sm font-semibold text-text-secondary">{title}</h4>
    {children}
  </div>
);

const DeleteConfirm = ({ pending, onConfirm }: { pending: boolean; onConfirm: () => void }) => {
  const [armed, setArmed] = useState(false);
  return armed ? (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="danger" disabled={pending} onClick={onConfirm}>
        {pending ? '...جارٍ' : 'تأكيد الحذف النهائي'}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setArmed(false)}>
        إلغاء
      </Button>
    </div>
  ) : (
    <Button size="sm" variant="danger" onClick={() => setArmed(true)}>
      حذف نهائي
    </Button>
  );
};

const PostBody = ({ initial, onClose }: { initial: ModPost; onClose: () => void }) => {
  const [isHidden, setIsHidden] = useState(initial.is_hidden);
  const [roast, setRoast] = useState(initial.roast_mode);

  const setHidden = useSetPostHidden();
  const approve = useApprovePost();
  const reject = useRejectPost();
  const del = useDeletePost();
  const busy = setHidden.isPending || approve.isPending || reject.isPending;

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">{TYPE_LABEL[initial.type] ?? initial.type}</Badge>
        <Badge variant={isHidden ? 'danger' : 'success'}>{isHidden ? 'مخفي' : 'ظاهر'}</Badge>
        {roast && <Badge variant="warning">وضع التحميص</Badge>}
        {initial.is_anonymous && <Badge variant="warning">مجهول</Badge>}
      </div>

      {initial.title && <h3 className="text-lg font-bold text-text">{initial.title}</h3>}

      <Section title="الكاتب">
        <p className="text-sm text-text">@{initial.author.username}{initial.author.rank ? ` · ${initial.author.rank}` : ''}</p>
        <p className="mt-1 text-xs text-text-secondary">
          {initial.reaction_count} تفاعل · {initial.comment_count} تعليق · {fmtDateTime(initial.created_at)}
        </p>
      </Section>

      {initial.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {initial.tags.map((t) => (
            <span key={t} className="rounded-full border border-border bg-gray px-2 py-0.5 text-xs text-text-secondary">
              {t}
            </span>
          ))}
        </div>
      )}

      <Section title="المحتوى">
        <p className="whitespace-pre-wrap text-sm text-text">{initial.content}</p>
      </Section>

      <Section title="إجراءات">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={async () => {
              const r = await setHidden.mutateAsync({ id: initial.id, isHidden: !isHidden });
              setIsHidden(r.is_hidden);
            }}
          >
            {isHidden ? 'إظهار' : 'إخفاء'}
          </Button>
          {roast ? (
            <Button size="sm" disabled={busy} onClick={async () => { await approve.mutateAsync(initial.id); setRoast(false); }}>
              اعتماد
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled={busy} onClick={async () => { await reject.mutateAsync(initial.id); setRoast(true); }}>
              تحويل لوضع التحميص
            </Button>
          )}
          <DeleteConfirm pending={del.isPending} onConfirm={async () => { await del.mutateAsync(initial.id); onClose(); }} />
        </div>
        <p className="mt-2 text-xs text-text-secondary">الإخفاء قابل للتراجع؛ الحذف نهائي.</p>
      </Section>
    </div>
  );
};

const CommentBody = ({ initial, onClose }: { initial: ModComment; onClose: () => void }) => {
  const [isHidden, setIsHidden] = useState(initial.is_hidden);
  const setHidden = useSetCommentHidden();
  const del = useDeleteComment();

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={isHidden ? 'danger' : 'success'}>{isHidden ? 'مخفي' : 'ظاهر'}</Badge>
      </div>

      <Section title="الكاتب">
        <p className="text-sm text-text">@{initial.author.username}</p>
        <p className="mt-1 text-xs text-text-secondary">{fmtDateTime(initial.created_at)}</p>
      </Section>

      <Section title="على منشور">
        <p className="text-sm text-text">{initial.post.title || `#${initial.post.id}`}</p>
      </Section>

      <Section title="المحتوى">
        <p className="whitespace-pre-wrap text-sm text-text">{initial.content}</p>
      </Section>

      <Section title="إجراءات">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={setHidden.isPending}
            onClick={async () => {
              const r = await setHidden.mutateAsync({ id: initial.id, isHidden: !isHidden });
              setIsHidden(r.is_hidden);
            }}
          >
            {isHidden ? 'إظهار' : 'إخفاء'}
          </Button>
          <DeleteConfirm pending={del.isPending} onConfirm={async () => { await del.mutateAsync(initial.id); onClose(); }} />
        </div>
      </Section>
    </div>
  );
};
