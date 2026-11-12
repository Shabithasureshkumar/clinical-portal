import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('min-w-0 rounded-[18px] border border-line-2 bg-white shadow-card', className)}
      {...rest}
    />
  )
}

interface CardHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  titleSize?: 'md' | 'lg'
  className?: string
}

export function CardHeader({ title, subtitle, action, titleSize = 'lg', className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2
          className={cn(
            'font-semibold tracking-[-0.01em] text-ink',
            titleSize === 'lg' ? 'text-[20.5px] leading-7' : 'text-[19px] leading-6',
          )}
        >
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-[14.8px] leading-5 text-faint">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-brand-600 hover:underline"
    >
      {children}
    </button>
  )
}
