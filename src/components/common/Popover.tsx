import { useId, useRef, useState, type ReactNode } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/utils/cn'

interface PopoverProps {
  /** Receives props to spread on the trigger button. */
  renderTrigger: (props: { onClick: () => void; 'aria-expanded': boolean; 'aria-haspopup': 'menu' | 'dialog'; 'aria-controls': string }) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'left' | 'right'
  panelClassName?: string
  role?: 'menu' | 'dialog'
  label?: string
  className?: string
}

/** Click-outside / Escape dismissible panel anchored to a trigger. */
export function Popover({ renderTrigger, children, align = 'right', panelClassName, role = 'menu', label, className }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  useClickOutside(ref, () => setOpen(false), open)

  return (
    <div ref={ref} className={cn('relative', className)}>
      {renderTrigger({ onClick: () => setOpen((o) => !o), 'aria-expanded': open, 'aria-haspopup': role, 'aria-controls': id })}
      {open && (
        <div
          id={id}
          role={role}
          aria-label={label}
          className={cn(
            'absolute z-40 mt-2 rounded-[14px] border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(15,40,60,0.16)]',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
