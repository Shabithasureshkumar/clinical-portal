interface LogoProps {
  size?: number
  className?: string
}

/** Mednevo mark: four interlocking rounded lobes forming a medical cross. */
export function LogoMark({ size = 36, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mn-g" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5ee0f5" />
          <stop offset="1" stopColor="#0aa8cb" />
        </linearGradient>
      </defs>
      <g stroke="url(#mn-g)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="11.5" r="7" />
        <circle cx="20" cy="28.5" r="7" />
        <circle cx="11.5" cy="20" r="7" />
        <circle cx="28.5" cy="20" r="7" />
      </g>
      <circle cx="20" cy="20" r="3" fill="url(#mn-g)" />
    </svg>
  )
}

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={38} />
      <span className="text-[24.5px] font-bold tracking-[-0.02em] text-ink">Mednevo</span>
    </div>
  )
}
