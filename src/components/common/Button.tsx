import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'soft' | 'danger' | 'ghost' | 'link'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-linear-to-b from-[#22d0ee] to-[#0cbfe3] text-white shadow-brand hover:brightness-105 active:brightness-95 border border-transparent',
  secondary: 'bg-white text-ink border border-line shadow-soft hover:bg-tint',
  soft: 'bg-brand-50 text-brand-700 border border-brand-200/70 hover:bg-brand-100',
  danger: 'bg-[#fff1f1] text-[#b53838] border border-[#fccaca] hover:bg-[#ffe6e6]',
  ghost: 'bg-transparent text-muted border border-transparent hover:bg-tint',
  link: 'bg-transparent text-brand-600 border border-transparent px-0 hover:underline',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13.5px] rounded-full gap-2',
  md: 'h-11 px-5 text-[15px] rounded-[12px] gap-2.5',
  lg: 'h-12 px-6 text-[15px] rounded-[12px] gap-2.5',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        variant !== 'link' && SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
}

export function IconButton({ label, children, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-line bg-white text-ink-2 shadow-soft transition hover:bg-tint',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
