import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Zap } from 'lucide-react';

interface PaginationProps {
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
}

export const Pagination: React.FC<PaginationProps> = ({
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
}) => {
  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  const isKeysetAvailable = Boolean(onCursorNext || onCursorPrev);

  // Generate page numbers window (5 pages max centered around current)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalElements === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-slate-900 dark:text-slate-100">{startItem}</strong>–
          <strong className="text-slate-900 dark:text-slate-100">{endItem}</strong> of{' '}
          <strong className="text-slate-900 dark:text-slate-100">{totalElements.toLocaleString()}</strong>
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Items per page"
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        {isKeysetAvailable && (
          <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Zap className="w-3 h-3" /> 15M Keyset Mode
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Keyset Cursor Seek Buttons if provided */}
        {isKeysetAvailable && onCursorPrev && (
          <button
            onClick={onCursorPrev}
            disabled={!prevCursor}
            title="Fast Keyset Seek Previous"
            className="px-2 py-1 mr-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 transition-colors"
          >
            ← Keyset Prev
          </button>
        )}

        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          title="First Page"
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          title="Previous Page"
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 rounded text-xs font-medium transition-all ${
                currentPage === p
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          title="Next Page"
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          title="Last Page"
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>

        {isKeysetAvailable && onCursorNext && (
          <button
            onClick={onCursorNext}
            disabled={hasMore === false || !nextCursor}
            title="Fast Keyset Seek Next"
            className="px-2 py-1 ml-1 text-xs font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
          >
            Keyset Next →
          </button>
        )}
      </div>
    </div>
  );
};
