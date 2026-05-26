import { useState } from 'react';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import {
  useComments,
  useDeleteComment,
  useDeletePost,
  usePosts,
  useSetCommentHidden,
  useSetPostHidden,
} from '../useModeration';

type Tab = 'posts' | 'comments';

interface DeleteTarget {
  kind: Tab;
  id: number;
  label: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function snippet(text: string, max = 90) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

const TYPE_LABEL: Record<string, string> = { RANT: 'فضفضة', CODE: 'كود' };

const ContentModerationPage = () => {
  const [tab, setTab] = useState<Tab>('posts');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [hidden, setHidden] = useState('');
  const [ordering, setOrdering] = useState('recent');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<DeleteTarget | null>(null);

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

  const resetAndSearch = () => {
    setQuery(search.trim());
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    if (toDelete.kind === 'posts') {
      await deletePost.mutateAsync(toDelete.id);
    } else {
      await deleteComment.mutateAsync(toDelete.id);
    }
    setToDelete(null);
  };

  const deleting = deletePost.isPending || deleteComment.isPending;
  const selectClass =
    'rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent';

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">إدارة المحتوى</h1>
        <p className="mt-1 text-sm text-text-secondary">
          استعرض وتحكّم في جميع المنشورات والتعليقات: إخفاء، إظهار، أو حذف نهائي.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['posts', 'comments'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            {t === 'posts' ? 'المنشورات' : 'التعليقات'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            resetAndSearch();
          }}
          className="flex gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'posts' ? 'بحث في المحتوى أو الكاتب...' : 'بحث في التعليق أو الكاتب...'}
            className="w-64 rounded-lg border border-border bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
          <Button type="submit" variant="secondary" size="sm">
            بحث
          </Button>
        </form>

        <select
          value={hidden}
          onChange={(e) => {
            setHidden(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">كل الحالات</option>
          <option value="false">ظاهر</option>
          <option value="true">مخفي</option>
        </select>

        {tab === 'posts' && (
          <>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">كل الأنواع</option>
              <option value="RANT">فضفضة</option>
              <option value="CODE">كود</option>
            </select>
            <select
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="recent">الأحدث</option>
              <option value="top">الأكثر تفاعلاً</option>
            </select>
          </>
        )}
      </div>

      {/* Content */}
      {active.isLoading ? (
        <Loader />
      ) : active.isError ? (
        <p className="text-red-400">تعذّر تحميل المحتوى.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-gray-light">
          {tab === 'posts' ? (
            <table className="w-full min-w-[820px] text-right text-sm">
              <thead className="border-b border-border bg-gray text-xs uppercase text-text-secondary">
                <tr>
                  <th className="px-4 py-3">المحتوى</th>
                  <th className="px-4 py-3">الكاتب</th>
                  <th className="px-4 py-3">النوع</th>
                  <th className="px-4 py-3">التفاعل</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">التاريخ</th>
                  <th className="px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(postsQuery.data?.results ?? []).map((post) => (
                  <tr key={post.id} className="hover:bg-gray transition-colors">
                    <td className="max-w-[280px] px-4 py-3">
                      {post.title && <div className="font-medium text-text">{post.title}</div>}
                      <div className="text-text-secondary">{snippet(post.content)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-text">@{post.author.username}</span>
                        {post.is_anonymous && <Badge variant="warning">مجهول</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{TYPE_LABEL[post.type] ?? post.type}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                      {post.reaction_count} تفاعل · {post.comment_count} تعليق
                    </td>
                    <td className="px-4 py-3">
                      {post.is_hidden ? (
                        <Badge variant="danger">مخفي</Badge>
                      ) : (
                        <Badge variant="success">ظاهر</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPostHidden.mutate({ id: post.id, isHidden: !post.is_hidden })}
                          disabled={setPostHidden.isPending}
                          className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50"
                        >
                          {post.is_hidden ? 'إظهار' : 'إخفاء'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setToDelete({
                              kind: 'posts',
                              id: post.id,
                              label: post.title || snippet(post.content, 40),
                            })
                          }
                          className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(postsQuery.data?.results ?? []).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                      لا توجد منشورات مطابقة.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="border-b border-border bg-gray text-xs uppercase text-text-secondary">
                <tr>
                  <th className="px-4 py-3">التعليق</th>
                  <th className="px-4 py-3">الكاتب</th>
                  <th className="px-4 py-3">على منشور</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">التاريخ</th>
                  <th className="px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(commentsQuery.data?.results ?? []).map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray transition-colors">
                    <td className="max-w-[320px] px-4 py-3 text-text">{snippet(comment.content)}</td>
                    <td className="px-4 py-3 text-text-secondary">@{comment.author.username}</td>
                    <td className="max-w-[200px] px-4 py-3 text-text-secondary">
                      {comment.post.title || `#${comment.post.id}`}
                    </td>
                    <td className="px-4 py-3">
                      {comment.is_hidden ? (
                        <Badge variant="danger">مخفي</Badge>
                      ) : (
                        <Badge variant="success">ظاهر</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                      {formatDate(comment.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCommentHidden.mutate({ id: comment.id, isHidden: !comment.is_hidden })
                          }
                          disabled={setCommentHidden.isPending}
                          className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50"
                        >
                          {comment.is_hidden ? 'إظهار' : 'إخفاء'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setToDelete({ kind: 'comments', id: comment.id, label: snippet(comment.content, 40) })
                          }
                          className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(commentsQuery.data?.results ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                      لا توجد تعليقات مطابقة.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            صفحة {meta.page} — {meta.total} عنصر
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              السابق
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!meta.has_more}
              onClick={() => setPage((p) => p + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
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
    </div>
  );
};

export default ContentModerationPage;
