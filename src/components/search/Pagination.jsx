import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white/60 hover:text-white hover:bg-white/[0.06]"
      >
        <ChevronLeft size={16} />
        Prev
      </button>

      <span className="text-sm text-white/40 tabular-nums">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white/60 hover:text-white hover:bg-white/[0.06]"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
