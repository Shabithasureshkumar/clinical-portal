import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: string
  className?: string
  trailing?: ReactNode
  iconSize?: number
  /** `bare` hides the left icon (used by the tinted "Search users" field). */
  bare?: boolean
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
  className,
  trailing,
  iconSize = 18,
  bare,
}: SearchInputProps) {
  return (
    <label className={cn('relative flex items-center', className)}>
      <span className="sr-only">{label ?? placeholder}</span>
      {!bare && <Search size={iconSize} className="pointer-events-none absolute left-4 text-ink-2" />}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-full w-full rounded-[inherit] bg-transparent pr-4 text-[15px] text-ink outline-none placeholder:text-muted',
          bare && 'text-[16px]',
          bare ? 'pl-[50px]' : 'pl-11',
        )}
      />
      {trailing}
    </label>
  )
}
