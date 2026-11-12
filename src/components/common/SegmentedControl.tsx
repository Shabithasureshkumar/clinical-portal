import { cn } from '@/utils/cn'

interface SegmentedControlProps<T extends string> {
  value: T
  options: readonly T[]
  onChange: (value: T) => void
  label: string
  className?: string
  size?: 'sm' | 'md'
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('inline-flex items-center gap-1 rounded-[12px] bg-[#f1f5f8] p-1', className)}
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          role="tab"
          aria-selected={opt === value}
          onClick={() => onChange(opt)}
          className={cn(
            'rounded-[9px] font-medium transition',
            size === 'md' ? 'h-9 px-4 text-[14.5px]' : 'h-8 px-3.5 text-[13.5px]',
            opt === value ? 'bg-white text-ink shadow-soft font-semibold' : 'text-faint hover:text-ink-2',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
