import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface FieldShellProps {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  className?: string
}

export function FieldShell({ label, htmlFor, error, children, className }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2.5 block text-[14px] font-semibold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-[13px] text-bad">
          {error}
        </p>
      )}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  leading?: ReactNode
  wrapperClassName?: string
}

export function TextField({ label, error, leading, wrapperClassName, className, id, ...rest }: TextFieldProps) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <FieldShell label={label} htmlFor={inputId} error={error} className={wrapperClassName}>
      <div
        className={cn(
          'flex h-[48px] items-center gap-3 rounded-[12px] border bg-white px-4 shadow-soft focus-within:border-brand-400',
          error ? 'border-bad' : 'border-line',
        )}
      >
        {leading && <span className="text-faint">{leading}</span>}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn('h-full w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-faint', className)}
          {...rest}
        />
      </div>
    </FieldShell>
  )
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function TextAreaField({ label, error, id, className, ...rest }: TextAreaFieldProps) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <FieldShell label={label} htmlFor={inputId} error={error}>
      <textarea
        id={inputId}
        className={cn(
          'h-[106px] w-full resize-none rounded-[12px] border border-line bg-white p-4 text-[15px] text-ink shadow-soft outline-none focus:border-brand-400',
          className,
        )}
        {...rest}
      />
    </FieldShell>
  )
}
