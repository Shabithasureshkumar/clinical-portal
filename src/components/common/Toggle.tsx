import { cn } from '@/utils/cn'

const SIZES = {
  sm: { w: 34, h: 20, knob: 14, shift: 14 },
  md: { w: 42, h: 24, knob: 18, shift: 18 },
  lg: { w: 48, h: 27, knob: 21, shift: 21 },
} as const

interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  size?: keyof typeof SIZES
  className?: string
}

export function Toggle({ checked, onChange, label, size = 'md', className }: ToggleProps) {
  const s = SIZES[size]
  const pad = (s.h - s.knob) / 2
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative inline-flex shrink-0 items-center rounded-full transition-colors', checked ? 'bg-[#12c2e6]' : 'bg-[#dfe6eb]', className)}
      style={{ width: s.w, height: s.h }}
    >
      <span
        className="absolute rounded-full bg-white shadow transition-transform"
        style={{ width: s.knob, height: s.knob, left: pad, transform: `translateX(${checked ? s.shift : 0}px)` }}
      />
    </button>
  )
}
