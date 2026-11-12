import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string[]
  /** Eyebrow rendered as a live-dot date line (Home). */
  dateLine?: string
  title: ReactNode
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, dateLine, title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-brand-600">
            {eyebrow.map((part, i) => (
              <span key={part} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={13} />}
                {part}
              </span>
            ))}
          </p>
        )}
        {dateLine && (
          <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-brand-600">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            {dateLine}
          </p>
        )}
        <h1 className="text-[32px] font-bold leading-[1.15] tracking-[-0.025em] text-ink sm:text-[36.5px]">{title}</h1>
        {subtitle && <p className="mt-3 text-[16.5px] text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  )
}
