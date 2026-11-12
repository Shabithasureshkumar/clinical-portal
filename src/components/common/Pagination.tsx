import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
  className?: string
}

export function Pagination({ page, pageCount, onChange, className }: PaginationProps) {
  if (pageCount <= 1) return null
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)
  const btn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] border px-2 text-[14px] font-medium transition'
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-end gap-2', className)}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={cn(btn, 'border-line bg-white text-ink-2 hover:bg-tint disabled:opacity-40')}
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
          className={cn(
            btn,
            p === page ? 'border-transparent bg-brand-500 text-white' : 'border-line bg-white text-ink-2 hover:bg-tint',
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        disabled={page === pageCount}
        onClick={() => onChange(page + 1)}
        className={cn(btn, 'border-line bg-white text-ink-2 hover:bg-tint disabled:opacity-40')}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
