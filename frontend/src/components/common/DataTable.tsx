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

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  selectedIds?: number[];
  isAllMatchingSelected?: boolean;
  onSelectRow?: (id: number) => void;
  onSelectAll?: (selectAll: boolean) => void;
  onSelectAllMatching?: () => void;
  onClearAllMatching?: () => void;
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
  emptyTitle?: string;
  emptyDescription?: string;
  onAddClick?: () => void;
  // Virtualization parameters
  virtualize?: boolean;
  rowHeight?: number;
  maxHeight?: number;
}

export function DataTable<T extends { id?: number }>({
  columns,
  data,
  isLoading,
  selectedIds = [],
  isAllMatchingSelected = false,
  onSelectRow,
  onSelectAll,
  onSelectAllMatching,
  onClearAllMatching,
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
  virtualize = false,
  rowHeight = 52,
  maxHeight = 650,
}: DataTableProps<T>) {
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

  // Reset scroll when page, sort, pageSize or data changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [currentPage, currentSort, pageSize, data?.length]);

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

  const isAllSelected = isAllMatchingSelected || (data.length > 0 && data.every((row) => row.id && selectedIds.includes(row.id)));
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

  // Virtual Window Calculation (Only renders visible rows in DOM if virtualize is explicitly enabled for large lists)
  const totalRows = data.length;
  const isVirtualized = virtualize && totalRows > 150;
  const overscan = 4;
  const startIndex = isVirtualized ? Math.max(0, Math.floor(scrollTop / rowHeight) - overscan) : 0;
  const visibleCount = isVirtualized ? Math.ceil(maxHeight / rowHeight) : totalRows;
  const endIndex = isVirtualized ? Math.min(totalRows - 1, startIndex + visibleCount + overscan * 2) : totalRows - 1;

  const visibleData = isVirtualized ? data.slice(startIndex, endIndex + 1) : data;
  const topPadding = isVirtualized ? startIndex * rowHeight : 0;
  const bottomPadding = isVirtualized ? Math.max(0, (totalRows - 1 - endIndex) * rowHeight) : 0;

  return (
    <div className="bg-white/80 dark:bg-[#0A0F1D]/80 backdrop-blur-2xl rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/50 border border-white/80 dark:border-slate-800/80 overflow-hidden transition-all">
      <div
        ref={containerRef}
        style={isVirtualized ? { maxHeight: `${maxHeight}px`, overflowY: 'auto' } : undefined}
        className="overflow-x-auto relative"
      >
        {isAllSelected && totalElements !== undefined && totalElements > data.length && (
          <div className="bg-amber-500/15 dark:bg-amber-950/60 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2 flex-wrap backdrop-blur-md">
            <span>
              {isAllMatchingSelected
                ? `All ${totalElements.toLocaleString()} records in this registry are selected.`
                : `All ${data.length} records on this page are selected.`}
            </span>
            {!isAllMatchingSelected && onSelectAllMatching ? (
              <button
                type="button"
                onClick={onSelectAllMatching}
                className="font-bold underline text-amber-700 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 cursor-pointer"
              >
                Select all {totalElements.toLocaleString()} records in this registry
              </button>
            ) : onClearAllMatching ? (
              <button
                type="button"
                onClick={onClearAllMatching}
                className="font-bold underline text-amber-700 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 cursor-pointer"
              >
                Clear selection
              </button>
            ) : null}
          </div>
        )}
        <table className="w-full text-left text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-100/80 dark:bg-slate-850/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-750/80 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            <tr>
              {onSelectRow && onSelectAll && (
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    aria-label="Select all rows"
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
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
                      col.sortable ? 'cursor-pointer hover:text-blue-600 dark:hover:text-cyan-400 transition-colors' : ''
                    } ${col.className || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isCurrentSorted ? (
                            sortDir === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
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

          <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
            {topPadding > 0 && (
              <tr>
                <td style={{ height: `${topPadding}px` }} colSpan={columns.length + 2} />
              </tr>
            )}

            {visibleData.map((row, index) => {
              const actualIndex = startIndex + index;
              const isSelected = row.id ? selectedIds.includes(row.id) : false;

              return (
                <tr
                  key={row.id || actualIndex}
                  style={isVirtualized ? { height: `${rowHeight}px` } : undefined}
                  className={`transition-all duration-150 hover:bg-blue-50/50 dark:hover:bg-blue-950/25 ${
                    isSelected ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-l-4 border-emerald-500' : ''
                  }`}
                >
                  {onSelectRow && (
                    <td className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => row.id && onSelectRow(row.id)}
                        aria-label={`Select row ${row.id || actualIndex}`}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
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
                      <div className="flex items-center justify-end gap-1.5">
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            title="View details"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 transition-all hover:scale-105"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            title="Edit"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/15 dark:hover:bg-blue-500/20 transition-all hover:scale-105"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            title="Delete"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/15 dark:hover:bg-rose-500/20 transition-all hover:scale-105"
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

export { VirtualizedDataTable } from './VirtualizedDataTable';
