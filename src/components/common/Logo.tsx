interface LogoProps {
  size?: number
  className?: string
}

/** Mednevo mark: four interlocking rounded lobes forming a medical cross. */
export function LogoMark({ size = 36, className }: LogoProps) {
  return <img src="/logo.png" width={size} height={size} alt="" aria-hidden="true" className={className} draggable={false} />
}

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={38} />
      <span className="text-[24.5px] font-bold tracking-[-0.02em] text-ink">Mednevo</span>
    </div>
  )
}
