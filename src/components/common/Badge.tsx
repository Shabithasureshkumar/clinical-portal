import type { ReactNode } from 'react'
import type { Tone } from '@/types'
import { TONES } from '@/utils/tones'
import { cn } from '@/utils/cn'

interface BadgeProps {
  tone?: Tone
  dot?: boolean
  children: ReactNode
  className?: string
  size?: 'sm' | 'md'
  square?: boolean
}

/** Status pill used for appointment/user/invoice states. */
export function Badge({ tone = 'neutral', dot, children, className, size = 'md', square }: BadgeProps) {
  const t = TONES[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap border font-semibold',
        square ? 'rounded-[8px]' : 'rounded-full',
        size === 'md' ? 'px-3 py-[5px] text-[13.5px]' : 'px-2.5 py-[3px] text-[12px]',
        className,
      )}
      style={{ background: t.bg, color: t.text, borderColor: t.border }}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.dot }} />}
      {children}
    </span>
  )
}

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-10 items-center rounded-full border px-5 text-[14px] font-medium transition',
        active
          ? 'border-transparent bg-linear-to-b from-[#22d0ee] to-[#0cbfe3] text-white shadow-brand'
          : 'border-line bg-white text-ink-2 hover:bg-tint',
        className,
      )}
    >
      {children}
    </button>
  )
}
