import { cn } from '@/utils/cn'

interface AvatarProps {
  initials?: string
  size?: number
  tint?: string
  className?: string
  ring?: boolean
  /** Empty ring placeholder used where the reference shows a photo slot. */
  placeholder?: boolean
  status?: string
}

export function Avatar({ initials, size = 42, tint, className, ring, placeholder, status }: AvatarProps) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        ring && 'ring-2 ring-white',
        placeholder ? 'border border-line bg-white' : 'text-white',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.32),
        background: placeholder
          ? undefined
          : (tint ?? 'linear-gradient(135deg,#5fe0f4 0%,#13bde0 100%)'),
        color: tint ? '#0c1b2e' : undefined,
      }}
    >
      {!placeholder && initials}
      {status && (
        <span
          className="absolute -right-0.5 bottom-0.5 h-3 w-3 rounded-full border-2 border-white"
          style={{ background: status }}
        />
      )}
    </span>
  )
}
