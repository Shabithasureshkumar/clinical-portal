import { Check, ChevronDown } from 'lucide-react'
import { useId, useRef, useState, type ReactNode } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'
import type { SelectOption } from '@/types'
import { cn } from '@/utils/cn'

interface DropdownProps<T extends string> {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  label: string
  /** Rendered text of the trigger; defaults to the selected option label. */
  display?: ReactNode
  leading?: ReactNode
  className?: string
  menuClassName?: string
  variant?: 'outline' | 'pill' | 'field'
  align?: 'left' | 'right'
}

/** Accessible listbox-style dropdown shared by filters, forms and toolbars. */
export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  label,
  display,
  leading,
  className,
  menuClassName,
  variant = 'outline',
  align = 'left',
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const listId = useId()
  useClickOutside(ref, () => setOpen(false), open)
  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between gap-3 border text-ink-2 transition hover:bg-tint',
          variant === 'outline' && 'h-[46px] gap-2 rounded-[12px] border-line bg-white px-[15px] text-[14px]',
          variant === 'pill' && 'h-[36px] rounded-full border-line bg-white px-4 text-[12.5px] shadow-soft',
          variant === 'field' && 'h-[48px] rounded-[12px] border-line bg-white px-4 text-[15px] shadow-soft',
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5 truncate">
          {leading}
          <span className="sr-only">{label}: </span>
          <span className="truncate">{display ?? selected?.label}</span>
        </span>
        <ChevronDown size={16} className={cn('shrink-0 text-ink-2 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          className={cn(
            'absolute z-30 mt-2 max-h-72 min-w-full overflow-auto rounded-[12px] border border-line bg-white p-1.5 shadow-[0_12px_32px_rgba(15,40,60,0.14)]',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-6 whitespace-nowrap rounded-[8px] px-3 py-2 text-left text-[14px] hover:bg-tint',
                  o.value === value ? 'font-semibold text-brand-700' : 'text-ink-2',
                )}
              >
                {o.label}
                {o.value === value && <Check size={14} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
