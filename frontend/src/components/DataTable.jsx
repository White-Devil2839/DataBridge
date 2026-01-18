import { useState, useMemo } from 'react';
import { cn } from '../utils/helpers';
import { formatDate } from '../utils/formatters';

const DataTable = ({
  columns: rawColumns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  sortable = true,
  className,
  pagination,
  onPageChange,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Normalize columns to handle both old format (key/label/render) and new format (header/accessor)
  const columns = useMemo(() => {
    return rawColumns.map((col, index) => ({
      key: col.key || col.header || `col_${index}`,
      label: col.label || col.header || '',
      render: col.render || (typeof col.accessor === 'function' ? (_, row) => col.accessor(row) : null),
      type: col.type,
      className: col.className,
    }));
  }, [rawColumns]);

  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !data) return data || [];

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [data, sortConfig]);

  const SortIcon = ({ columnKey }) => {
    if (!sortable) return null;
    
    const isActive = sortConfig.key === columnKey;
    return (
      <span className="ml-2 inline-flex">
        {isActive ? (
          sortConfig.direction === 'asc' ? (
            <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )
        ) : (
          <svg className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={cn('overflow-hidden rounded-xl border border-surface-700/50', className)}>
        <table className="w-full">
          <thead>
            <tr className="bg-surface-800/50">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-surface-700">
                  <div className="h-4 bg-surface-700 rounded animate-pulse w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-surface-700/50 last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-surface-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('rounded-xl border border-surface-700/50 bg-surface-800/30 p-12 text-center', className)}>
        <svg className="mx-auto w-12 h-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={cn('overflow-x-auto rounded-xl border border-surface-700/50', className)}>
        <table className="w-full">
          <thead>
            <tr className="bg-surface-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-surface-700 group',
                    sortable && 'cursor-pointer hover:text-gray-300 select-none'
                  )}
                >
                  <div className="flex items-center">
                    {col.label}
                    <SortIcon columnKey={col.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700/50">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors duration-150',
                  'hover:bg-surface-700/30',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => {
                  let value = row[col.key];
                  
                  // Handle nested keys like 'data.price'
                  if (col.key && typeof col.key === 'string' && col.key.includes('.')) {
                    value = col.key.split('.').reduce((obj, key) => obj?.[key], row);
                  }

                  // Use custom render if provided
                  const content = col.render
                    ? col.render(value, row)
                    : col.type === 'date'
                    ? formatDate(value, 'datetime')
                    : value ?? 'N/A';

                  return (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-sm text-gray-300',
                        col.className
                      )}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && onPageChange && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.pages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

// Pagination component
export const Pagination = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}) => {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 mt-4', className)}>
      <p className="text-sm text-gray-400">
        Showing <span className="font-medium text-gray-300">{start}</span> to{' '}
        <span className="font-medium text-gray-300">{end}</span> of{' '}
        <span className="font-medium text-gray-300">{total}</span> results
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            page <= 1
              ? 'bg-surface-800 text-gray-600 cursor-not-allowed'
              : 'bg-surface-700 text-gray-300 hover:bg-surface-600'
          )}
        >
          Previous
        </button>
        <div className="flex items-center gap-1">
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                  page === pageNum
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-700 text-gray-300 hover:bg-surface-600'
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            page >= totalPages
              ? 'bg-surface-800 text-gray-600 cursor-not-allowed'
              : 'bg-surface-700 text-gray-300 hover:bg-surface-600'
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DataTable;
