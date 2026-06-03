import type { ReactNode } from 'react';
import { Loader } from './Loader';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  /** Hide this column in the mobile stacked-card view (e.g. low-priority meta). */
  hideOnMobile?: boolean;
  /** Label shown beside the value in the mobile card (defaults to `header`). */
  mobileLabel?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyField: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  empty?: ReactNode;
}

/**
 * Responsive admin table: a real <table> at md+ and a stacked label/value card
 * per row below md (so it never overflows horizontally on phones). Pair with
 * <Pagination> for server-paged data.
 */
export function DataTable<T>({ columns, rows, keyField, onRowClick, loading, empty }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-gray-light p-10">
        <Loader />
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-gray-light p-10 text-center text-sm text-text-secondary">
        {empty ?? 'لا توجد بيانات.'}
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-gray-light md:block">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-border bg-gray text-xs uppercase text-text-secondary">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 font-semibold ${c.className ?? ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr
                key={keyField(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition-colors hover:bg-gray ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${c.className ?? ''}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div
            key={keyField(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={`rounded-xl border border-border bg-gray-light p-4 ${
              onRowClick ? 'cursor-pointer active:bg-gray' : ''
            }`}
          >
            {columns
              .filter((c) => !c.hideOnMobile)
              .map((c) => (
                <div
                  key={c.key}
                  className="flex items-center justify-between gap-3 border-b border-border/50 py-1.5 last:border-0"
                >
                  <span className="shrink-0 text-xs text-text-secondary">{c.mobileLabel ?? c.header}</span>
                  <span className="text-left text-sm text-text">{c.render(row)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}
