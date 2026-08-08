export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-y-2 pt-4">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="inline-flex items-center justify-center h-10 px-2 sm:px-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
      >
        <span className="sm:hidden" aria-hidden="true">‹</span>
        <span className="hidden sm:inline">Previous</span>
      </button>
      <div className="flex flex-wrap items-center justify-center gap-1">
        {pages.map((p, idx) => (
          <span key={p} className="flex items-center">
            {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-slate-400">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-10 h-10 rounded-lg text-sm ${
                p === page
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="inline-flex items-center justify-center h-10 px-2 sm:px-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
      >
        <span className="sm:hidden" aria-hidden="true">›</span>
        <span className="hidden sm:inline">Next</span>
      </button>
    </div>
  );
}
