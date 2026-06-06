import { Button } from './Button';

interface PaginationProps {
  page: number;
  hasMore: boolean;
  total?: number;
  limit?: number;
  onPageChange: (page: number) => void;
}

/** Server-paged navigator matching the backend `{total,page,limit,has_more}` shape. */
export const Pagination = ({ page, hasMore, total, limit, onPageChange }: PaginationProps) => {
  const totalPages = total != null && limit ? Math.max(1, Math.ceil(total / limit)) : undefined;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-xs text-text-secondary">
        صفحة {page}
        {totalPages ? ` من ${totalPages}` : ''}
        {total != null ? ` · ${total} عنصر` : ''}
      </p>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          السابق
        </Button>
        <Button size="sm" variant="secondary" disabled={!hasMore} onClick={() => onPageChange(page + 1)}>
          التالي
        </Button>
      </div>
    </div>
  );
};
