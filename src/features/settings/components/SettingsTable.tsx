import type { ReactNode } from 'react'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { SettingsCard } from './SettingsCard'

interface SettingsTableProps<T> {
  title?: string
  subtitle?: string
  action?: ReactNode
  toolbar?: ReactNode
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /** Tailwind grid-template-columns class, e.g. grid-cols-[2fr_1fr_1fr]. */
  template: string
  minWidth?: number
  emptyTitle?: string
  emptyDescription?: string
}

/** Settings list: toolbar (search / filters) above a sortable, horizontally scrollable table. */
export function SettingsTable<T>({ title, subtitle, action, toolbar, columns, rows, rowKey, template, minWidth = 760, emptyTitle, emptyDescription }: SettingsTableProps<T>) {
  return (
    <SettingsCard title={title} subtitle={subtitle} action={action}>
      {toolbar && <div className={`${title || action ? 'mt-5' : ''} flex flex-wrap items-center gap-3`}>{toolbar}</div>}
      <div className="mt-5 overflow-hidden rounded-[16px] border border-line-2">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={rowKey}
          minWidth={minWidth}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          headerClassName={`${template} gap-4 bg-brand-50/60 px-5 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.05em] text-ink-2`}
          rowClassName={`${template} gap-4 border-t border-line-2 px-5 py-3.5`}
        />
      </div>
    </SettingsCard>
  )
}
