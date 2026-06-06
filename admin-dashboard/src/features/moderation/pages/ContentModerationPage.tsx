import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/ui/Pagination';
import {
  useComments,
  useDeleteComment,
  useDeletePost,
  usePosts,
  useSetCommentHidden,
  useSetPostHidden,
} from '../useModeration';
import type { ModComment, ModPost } from '../moderationService';
import { ContentDetailDrawer, type SelectedContent } from '../components/ContentDetailDrawer';

type Tab = 'posts' | 'comments';

interface DeleteTarget {
  kind: Tab;
  id: number;
  label: string;
}

const TABS: TabItem<Tab>[] = [
  { key: 'posts', label: 'المنشورات' },
  { key: 'comments', label: 'التعليقات' },
];

const TYPE_LABEL: Record<string, string> = { RANT: 'فضفضة', CODE: 'كود' };

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function snippet(text: string, max = 90) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

const ContentModerationPage = () => {
  const [tab, setTab] = useState<Tab>('posts');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [hidden, setHidden] = useState('');
  const [ordering, setOrdering] = useState('recent');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<DeleteTarget | null>(null);
  const [selected, setSelected] = useState<SelectedContent | null>(null);

  const postsQuery = usePosts({ q: query, type, hidden, ordering, page }, tab === 'posts');
  const commentsQuery = useComments({ q: query, hidden, page }, tab === 'comments');

  const setPostHidden = useSetPostHidden();
  const deletePost = useDeletePost();
  const setCommentHidden = useSetCommentHidden();
  const deleteComment = useDeleteComment();

  const active = tab === 'posts' ? postsQuery : commentsQuery;
  const meta = active.data;

  const switchTab = (next: Tab) => {
    setTab(next);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    if (toDelete.kind === 'posts') await deletePost.mutateAsync(toDelete.id);
    else await deleteComment.mutateAsync(toDelete.id);
    setToDelete(null);
  };

  const deleting = deletePost.isPending || deleteComment.isPending;

  const postColumns: Column<ModPost>[] = [
    {
      key: 'content',
      header: 'المحتوى',
      className: 'max-w-[280px]',
      render: (p) => (
        <div>
          {p.title && <div className="font-medium text-text">{p.title}</div>}
          <div className="text-text-secondary">{snippet(p.content)}</div>
        </div>
      ),
    },
    {
      key: 'author',
      header: 'الكاتب',
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="text-text">@{p.author.username}</span>
          {p.is_anonymous && <Badge variant="warning">مجهول</Badge>}
        </div>
      ),
    },
    { key: 'type', header: 'النوع', render: (p) => <span className="text-text-secondary">{TYPE_LABEL[p.type] ?? p.type}</span> },
    {
      key: 'engagement',
      header: 'التفاعل',
      render: (p) => (
        <span className="whitespace-nowrap text-text-secondary">
          {p.reaction_count} تفاعل · {p.comment_count} تعليق
        </span>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (p) =>
        p.is_hidden ? <Badge variant="danger">مخفي</Badge> : <Badge variant="success">ظاهر</Badge>,
    },
    {
      key: 'date',
      header: 'التاريخ',
      render: (p) => <span className="whitespace-nowrap text-text-secondary">{formatDate(p.created_at)}</span>,
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (p) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setPostHidden.mutate({ id: p.id, isHidden: !p.is_hidden })}
            disabled={setPostHidden.isPending}
            className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {p.is_hidden ? 'إظهار' : 'إخفاء'}
          </button>
          <button
            type="button"
            onClick={() => setToDelete({ kind: 'posts', id: p.id, label: p.title || snippet(p.content, 40) })}
            className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
          >
            حذف
          </button>
        </div>
      ),
    },
  ];

  const commentColumns: Column<ModComment>[] = [
    { key: 'content', header: 'التعليق', className: 'max-w-[320px]', render: (c) => <span className="text-text">{snippet(c.content)}</span> },
    { key: 'author', header: 'الكاتب', render: (c) => <span className="text-text-secondary">@{c.author.username}</span> },
    {
      key: 'post',
      header: 'على منشور',
      render: (c) => <span className="text-text-secondary">{c.post.title || `#${c.post.id}`}</span>,
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (c) =>
        c.is_hidden ? <Badge variant="danger">مخفي</Badge> : <Badge variant="success">ظاهر</Badge>,
    },
    {
      key: 'date',
      header: 'التاريخ',
      render: (c) => <span className="whitespace-nowrap text-text-secondary">{formatDate(c.created_at)}</span>,
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (c) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setCommentHidden.mutate({ id: c.id, isHidden: !c.is_hidden })}
            disabled={setCommentHidden.isPending}
            className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {c.is_hidden ? 'إظهار' : 'إخفاء'}
          </button>
          <button
            type="button"
            onClick={() => setToDelete({ kind: 'comments', id: c.id, label: snippet(c.content, 40) })}
            className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
          >
            حذف
          </button>
        </div>
      ),
    },
  ];

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">إدارة المحتوى</h1>
        <p className="mt-1 text-sm text-text-secondary">
          استعرض وتحكّم في جميع المنشورات والتعليقات: إخفاء، إظهار، أو حذف نهائي.
        </p>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={switchTab} />

      <div className="flex flex-wrap items-end gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
            setPage(1);
          }}
          className="flex gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'posts' ? 'بحث في المحتوى أو الكاتب...' : 'بحث في التعليق أو الكاتب...'}
            className="w-full min-w-[12rem] rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent sm:w-64"
          />
          <Button type="submit" variant="secondary" size="sm">
            بحث
          </Button>
        </form>

        <Select
          value={hidden}
          onChange={(e) => {
            setHidden(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'كل الحالات' },
            { value: 'false', label: 'ظاهر' },
            { value: 'true', label: 'مخفي' },
          ]}
        />

        {tab === 'posts' && (
          <>
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'كل الأنواع' },
                { value: 'RANT', label: 'فضفضة' },
                { value: 'CODE', label: 'كود' },
              ]}
            />
            <Select
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'recent', label: 'الأحدث' },
                { value: 'top', label: 'الأكثر تفاعلاً' },
              ]}
            />
          </>
        )}
      </div>

      {active.isError ? (
        <p className="text-red-400">تعذّر تحميل المحتوى.</p>
      ) : tab === 'posts' ? (
        <DataTable
          columns={postColumns}
          rows={postsQuery.data?.results ?? []}
          keyField={(p) => p.id}
          onRowClick={(p) => setSelected({ type: 'post', item: p })}
          loading={postsQuery.isLoading}
          empty="لا توجد منشورات مطابقة."
        />
      ) : (
        <DataTable
          columns={commentColumns}
          rows={commentsQuery.data?.results ?? []}
          keyField={(c) => c.id}
          onRowClick={(c) => setSelected({ type: 'comment', item: c })}
          loading={commentsQuery.isLoading}
          empty="لا توجد تعليقات مطابقة."
        />
      )}

      {meta && (
        <Pagination
          page={meta.page}
          hasMore={meta.has_more}
          total={meta.total}
          limit={meta.limit}
          onPageChange={setPage}
        />
      )}

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)} title="تأكيد الحذف النهائي">
        <p className="mb-6 text-text-secondary">
          سيتم حذف {toDelete?.kind === 'posts' ? 'المنشور' : 'التعليق'}{' '}
          <span className="text-text">«{toDelete?.label}»</span> نهائياً. لا يمكن التراجع عن هذا الإجراء.
          <br />
          <span className="text-xs">للإخفاء المؤقت القابل للتراجع استخدم زر «إخفاء» بدلاً من الحذف.</span>
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToDelete(null)}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? '...جارٍ' : 'حذف نهائي'}
          </Button>
        </div>
      </Modal>

      <ContentDetailDrawer selected={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default ContentModerationPage;
