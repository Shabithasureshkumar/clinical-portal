import type { ReactNode } from 'react'
import { Card } from '@/components/common/Card'
import { cn } from '@/utils/cn'

interface SettingsCardProps {
  id?: string
  title?: string
  subtitle?: string
  action?: ReactNode
  children?: ReactNode
  className?: string
}

/** Standard settings panel: same card, radius and padding as the rest of the portal. */
export function SettingsCard({ id, title, subtitle, action, children, className }: SettingsCardProps) {
  return (
    <Card id={id} className={cn('scroll-mt-24 rounded-[22px] p-[18px] sm:p-[25px]', className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h2 className="text-[20.5px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>}
            {subtitle && <p className="mt-2 text-[14.8px] text-faint">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </Card>
  )
}
