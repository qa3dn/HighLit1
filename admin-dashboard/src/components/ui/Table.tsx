import React from 'react';

interface Column {
  header: string;
  accessor: string;
  render?: (value: unknown, item: Record<string, unknown>) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: Record<string, unknown>[];
}

export const Table: React.FC<TableProps> = ({ columns, data }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-gray-light shadow-medium">
      <table className="w-full text-left text-sm text-text-secondary">
        <thead className="bg-gray text-text uppercase font-sans border-b border-border text-xs">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-6 py-4 font-semibold tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="hover:bg-gray transition-colors duration-150 animate-fade-in font-sans"
                style={{ animationDelay: `${rowIndex * 30}ms` }}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(row[col.accessor], row) : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-text-secondary font-sans animate-fade-in">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
