import { ChevronDown } from 'lucide-react'
import { useId, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { FieldShell } from './Fields'

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string
  options: readonly string[] | readonly { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  wrapperClassName?: string
}

/** Native select styled like the other fields: accessible, keyboard friendly and mobile friendly. */
export function SelectField({ label, options, value, onChange, error, hint, wrapperClassName, id, className, ...rest }: SelectFieldProps) {
  const auto = useId()
  const selectId = id ?? auto
  return (
    <FieldShell label={label} htmlFor={selectId} error={error} className={wrapperClassName}>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-[48px] w-full appearance-none rounded-[12px] border bg-white pl-4 pr-10 text-[15px] text-ink shadow-soft outline-none focus:border-brand-400',
            error ? 'border-bad' : 'border-line',
            className,
          )}
          {...rest}
        >
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o
            return (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )
          })}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-2" />
      </div>
      {hint && !error && <p className="mt-1.5 text-[12.5px] text-faint">{hint}</p>}
    </FieldShell>
  )
}

interface ChipSelectProps {
  label: string
  options: readonly { value: string; label: string }[]
  selected: string[]
  onChange: (next: string[]) => void
  error?: string
  hint?: string
}

/** Multi-select rendered as toggleable chips (working days, providers, locations…). */
export function ChipSelect({ label, options, selected, onChange, error, hint }: ChipSelectProps) {
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v])
  return (
    <fieldset>
      <legend className="mb-2.5 block text-[14px] font-semibold text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => {
          const on = selected.includes(o.value)
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o.value)}
              className={cn(
                'h-[38px] rounded-full border px-4 text-[13.5px] font-medium transition',
                on ? 'border-transparent bg-linear-to-b from-[#22d0ee] to-[#0cbfe3] text-white shadow-brand' : 'border-line bg-white text-ink-2 hover:bg-tint',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      {hint && !error && <p className="mt-1.5 text-[12.5px] text-faint">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-[13px] text-bad">
          {error}
        </p>
      )}
    </fieldset>
  )
}
