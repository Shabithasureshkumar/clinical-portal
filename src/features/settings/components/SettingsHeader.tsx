import type { ReactNode } from 'react'
import { SettingsCard } from './SettingsCard'

interface StatTile {
  label: string
  value: string | number
  tone?: 'default' | 'ok' | 'warn'
}

interface SettingsHeaderProps {
  title: string
  description: string
  actions?: ReactNode
  stats?: StatTile[]
}

const TONE = { default: 'text-ink', ok: 'text-ok', warn: 'text-warn' } as const

/** Section heading + description, optional primary actions and summary tiles. */
export function SettingsHeader({ title, description, actions, stats }: SettingsHeaderProps) {
  return (
    <SettingsCard title={title} subtitle={description} action={actions}>
      {stats && stats.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[14px] border border-line-2 bg-linear-to-b from-brand-50/50 to-white px-4 py-3">
              <dt className="text-[12.5px] text-muted">{s.label}</dt>
              <dd className={`mt-1 text-[22px] font-bold ${TONE[s.tone ?? 'default']}`}>{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </SettingsCard>
  )
}
