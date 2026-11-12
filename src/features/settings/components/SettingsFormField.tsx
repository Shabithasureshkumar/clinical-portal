import { useSyncedState } from '@/hooks/useSyncedState'
import { useState, type ReactNode } from 'react'
import { TextAreaField, TextField } from '@/components/forms/Fields'
import { ChipSelect, SelectField } from '@/components/forms/SelectFields'

export { TextAreaField, TextField, SelectField, ChipSelect }

/** Responsive two-column form grid; stacks on small screens. */
export function FormGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  const map = { 1: '', 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 xl:grid-cols-3' } as const
  return <div className={`grid gap-x-6 gap-y-5 ${map[cols]}`}>{children}</div>
}

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  error?: string
  hint?: string
}

/** Numeric input that lets the user clear and retype without the value snapping back. */
export function NumberField({ label, value, onChange, min, max, step = 1, suffix, error, hint }: NumberFieldProps) {
  // Mirror external changes (reset/cancel) but never while the user is typing, so "5." does not snap back to "5".
  const [focused, setFocused] = useState(false)
  const [text, setText] = useSyncedState(focused ? 'editing' : value, () => String(value))

  return (
    <div>
      <TextField
        label={label}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={text}
        error={error}
        onChange={(e) => {
          setText(e.target.value)
          const n = Number(e.target.value)
          if (e.target.value !== '' && Number.isFinite(n)) onChange(n)
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          setText(String(value))
        }}
        leading={suffix ? <span className="text-[13px]">{suffix}</span> : undefined}
      />
      {hint && !error && <p className="-mt-0.5 mt-1.5 text-[12.5px] text-faint">{hint}</p>}
    </div>
  )
}
