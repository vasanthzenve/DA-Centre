import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit2, Trash2 } from 'lucide-react';
import { Pagination } from './Pagination';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';

export interface Column<T> {
  header: string;
  accessor?: keyof T | string;
  sortable?: boolean;
  sortField?: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface VirtualizedDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  selectedIds?: number[];
  onSelectRow?: (id: number) => void;
  onSelectAll?: (selectAll: boolean) => void;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  // Sorting
  currentSort?: string;
  onSortChange?: (sortField: string) => void;
  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Keyset / Cursor Pagination for 15M Records
  nextCursor?: number | null;
  prevCursor?: number | null;
  hasMore?: boolean;
  onCursorNext?: () => void;
  onCursorPrev?: () => void;
  // Empty State
  emptyTitle?: string;
  emptyDescription?: string;
  onAddClick?: () => void;
  // Virtualization
  rowHeight?: number;
  maxHeight?: number;
}

export function VirtualizedDataTable<T extends { id?: number }>({
  columns,
  data,
  isLoading,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  currentSort = 'id,desc',
  onSortChange,
  currentPage,
  totalPages,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange,
  nextCursor,
  prevCursor,
  hasMore,
  onCursorNext,
  onCursorPrev,
  emptyTitle,
  emptyDescription,
  onAddClick,
  rowHeight = 52,
  maxHeight = 650,
}: VirtualizedDataTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Reset scroll when page changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [currentPage, currentSort]);

  if (isLoading) {
    return <LoadingSkeleton rows={pageSize > 10 ? 10 : pageSize} />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onAddClick ? 'Add Record' : undefined}
        onAction={onAddClick}
      />
    );
  }

  const isAllSelected = data.length > 0 && data.every((row) => row.id && selectedIds.includes(row.id));
  const [sortField, sortDir] = currentSort.split(',');

  const handleHeaderClick = (col: Column<T>) => {
    if (!col.sortable || !onSortChange) return;
    const field = col.sortField || (col.accessor as string);
    if (!field) return;

    if (sortField === field) {
      onSortChange(`${field},${sortDir === 'asc' ? 'desc' : 'asc'}`);
    } else {
      onSortChange(`${field},asc`);
    }
  };

  // Virtual Window Calculation (Overscan = 5 rows)
  const totalRows = data.length;
  const overscan = 5;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.ceil(maxHeight / rowHeight);
  const endIndex = Math.min(totalRows - 1, startIndex + visibleCount + overscan * 2);

  const visibleData = data.slice(startIndex, endIndex + 1);
  const topPadding = startIndex * rowHeight;
  const bottomPadding = Math.max(0, (totalRows - 1 - endIndex) * rowHeight);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Scrollable Container with Virtual Height */}
      <div
        ref={containerRef}
        style={{ maxHeight: `${maxHeight}px`, overflowY: 'auto' }}
        className="overflow-x-auto relative"
      >
        <table className="w-full text-left text-sm border-collapse">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-850/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              {onSelectRow && onSelectAll && (
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    aria-label="Select all rows"
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                  />
                </th>
              )}

              {columns.map((col, idx) => {
                const field = col.sortField || (col.accessor as string);
                const isCurrentSorted = sortField === field;

                return (
                  <th
                    key={idx}
                    onClick={() => handleHeaderClick(col)}
                    className={`py-3.5 px-4 whitespace-nowrap select-none ${
                      col.sortable ? 'cursor-pointer hover:text-emerald-600 transition-colors' : ''
                    } ${col.className || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isCurrentSorted ? (
                            sortDir === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}

              {(onView || onEdit || onDelete) && (
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* Top Virtual Spacer */}
            {topPadding > 0 && (
              <tr>
                <td style={{ height: `${topPadding}px` }} colSpan={columns.length + 2} />
              </tr>
            )}

            {/* Virtualized Visible Rows */}
            {visibleData.map((row, index) => {
              const actualIndex = startIndex + index;
              const isSelected = row.id ? selectedIds.includes(row.id) : false;

              return (
                <tr
                  key={row.id || actualIndex}
                  style={{ height: `${rowHeight}px` }}
                  className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50 ${
                    isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  {onSelectRow && (
                    <td className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => row.id && onSelectRow(row.id)}
                        aria-label={`Select row ${row.id || actualIndex}`}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                      />
                    </td>
                  )}

                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`py-3.5 px-4 text-slate-700 dark:text-slate-300 align-middle ${
                        col.className || ''
                      }`}
                    >
                      {col.render
                        ? col.render(row)
                        : (row as any)[col.accessor as string] !== undefined &&
                          (row as any)[col.accessor as string] !== null
                        ? String((row as any)[col.accessor as string])
                        : '—'}
                    </td>
                  ))}

                  {(onView || onEdit || onDelete) && (
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            title="View details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}

            {/* Bottom Virtual Spacer */}
            {bottomPadding > 0 && (
              <tr>
                <td style={{ height: `${bottomPadding}px` }} colSpan={columns.length + 2} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalElements={totalElements}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        nextCursor={nextCursor}
        prevCursor={prevCursor}
        hasMore={hasMore}
        onCursorNext={onCursorNext}
        onCursorPrev={onCursorPrev}
      />
    </div>
  );
}
