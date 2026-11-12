import { Toggle } from '@/components/common/Toggle'

interface SettingsToggleProps {
  title: string
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}

/** Label + helper text with a switch, as used throughout the existing settings design. */
export function SettingsToggle({ title, description, checked, onChange, disabled }: SettingsToggleProps) {
  return (
    <div className={`flex items-center justify-between gap-6 ${disabled ? 'opacity-50' : ''}`}>
      <div className="min-w-0">
        <p className="text-[15.5px] font-semibold text-ink">{title}</p>
        {description && <p className="mt-1.5 text-[13.5px] text-faint">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={(v) => !disabled && onChange(v)} label={title} size="md" />
    </div>
  )
}
