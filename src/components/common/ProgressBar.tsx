interface ProgressBarProps {
  value: number
  label?: string
  height?: number
}

export function ProgressBar({ value, label, height = 8 }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="w-full overflow-hidden rounded-full bg-[#eef3f6]"
      style={{ height }}
    >
      <div
        className="h-full rounded-full bg-linear-to-r from-[#12c2e6] to-[#7ddcee]"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
