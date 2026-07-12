import React from 'react';

type Column<T> = {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T) => string;
  emptyState?: React.ReactNode;
}

export default function DataTable<T>({ columns, data, rowKey, emptyState }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
        {emptyState ?? 'No records available.'}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/20">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-100 text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className={`px-6 py-4 font-semibold ${column.className ?? ''}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={rowKey(item)} className="border-t border-slate-200 bg-white hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.header} className={`px-6 py-4 align-top ${column.className ?? ''}`}>
                    {column.accessor(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
