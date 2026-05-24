import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button className="btn btn-ghost btn-sm btn-square" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="text-base-content/40 px-1 select-none">...</span>
        ) : (
          <button key={p} className={`btn btn-sm min-w-9 ${p === currentPage ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onPageChange(p)}>
            {p}
          </button>
        ),
      )}
      <button className="btn btn-ghost btn-sm btn-square" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
