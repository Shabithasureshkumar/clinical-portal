import { UserPhoto } from '@/components/common/UserPhoto'
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Phone,
  Repeat2,
  Sparkles,
  UserCheck,
  Video,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Fragment } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/States'
import type { ScheduleRow, ScheduleStatus, Tone, VisitType } from '@/types'
import { cn } from '@/utils/cn'

const TYPE_ICON: Record<VisitType, LucideIcon> = {
  'In-Person': UserCheck,
  'Video Visit': Video,
  'Phone Call': Phone,
}

const STATUS_TONE: Record<ScheduleStatus, Tone> = {
  'Checked-In': 'brand',
  'Open Slot': 'info',
  Waiting: 'warn',
  Confirmed: 'ok',
  'In Progress': 'info',
}

export type RowActionKind = 'check-in' | 'start' | 'message' | 'reassign' | 'cancel'

export const GRID = 'grid-cols-[108px_376px_301px_219px_220px_1fr_36px]'

interface Props {
  rows: ScheduleRow[]
  expandedId: string | null
  onToggle: (id: string) => void
  selected: Set<string>
  onSelect: (id: string) => void
  onRowAction: (kind: RowActionKind, row: ScheduleRow) => void
}

export function ScheduleTable({ rows, expandedId, onToggle, selected, onSelect, onRowAction }: Props) {
  return (
    <div className="scrollbar-thin overflow-x-auto" role="region" aria-label="Appointments table" tabIndex={0}>
      <div role="table" aria-label="Appointments" className="min-w-[960px]">
        <div role="row" className={cn('grid items-center border-b border-line-2 px-4 py-[14px] text-[14px] font-semibold text-ink', GRID)}>
          {['Time', 'Appointment', 'Provider', 'Type', 'Status', 'Room'].map((h) => (
            <div key={h} role="columnheader">
              {h}
            </div>
          ))}
          <div />
        </div>

        {rows.length === 0 && <EmptyState title="No appointments match" description="Try clearing the filters or search." />}

        {rows.map((r) => {
          const TypeIcon = TYPE_ICON[r.type]
          const open = expandedId === r.id
          return (
            <Fragment key={r.id}>
              <div
                role="row"
                onClick={() => onSelect(r.id)}
                tabIndex={0}
                aria-selected={selected.has(r.id)}
                onKeyDown={(e) => {
                  if (e.target === e.currentTarget && (e.key === ' ' || e.key === 'Enter')) {
                    e.preventDefault()
                    onSelect(r.id)
                  }
                }}
                className={cn(
                  'grid cursor-pointer items-center border-b border-line-2 px-4 py-[15px] text-[13.5px] transition-colors hover:bg-[#f7fcfd]',
                  GRID,
                  r.isOpenSlot && 'bg-[#f2fafd]',
                  selected.has(r.id) && !r.isOpenSlot && 'bg-[#fbfeff]',
                )}
              >
                <div role="cell" className="text-ink-2">
                  {r.time}
                </div>
                <div role="cell" className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {r.title}
                    {r.mrn && <span className="font-normal text-muted"> ({r.mrn})</span>}
                  </p>
                  <p className="truncate text-[12.5px] text-muted">{r.subtitle}</p>
                </div>
                <div role="cell" className="flex min-w-0 items-center gap-3">
                  <UserPhoto name={r.provider} size={34} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{r.provider}</p>
                    <p className="truncate text-[12px] text-muted">{r.specialty}</p>
                  </div>
                </div>
                <div role="cell" className="flex items-center gap-2 text-muted">
                  <TypeIcon size={15} className="text-brand-600" />
                  {r.type}
                </div>
                <div role="cell">
                  <Badge tone={STATUS_TONE[r.status]} size="sm" className="!px-3.5 !py-[4px] !text-[13px]">
                    {r.statusLabel ?? r.status}
                  </Badge>
                </div>
                <div role="cell" className="text-muted">
                  {r.room}
                </div>
                <div role="cell" className="flex justify-end">
                  <button
                    type="button"
                    aria-label={open ? 'Collapse row' : 'Expand row'}
                    aria-expanded={open}
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggle(r.id)
                    }}
                    className="rounded-md p-1 text-ink-2 hover:bg-tint"
                  >
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {open && r.details && (
                <div role="row"><div role="cell" className="grid gap-5 border-b border-line-2 bg-[#fcfeff] px-4 py-4 lg:grid-cols-[1.02fr_1fr]">
                  <div className="rounded-[14px] border border-line-2 bg-white p-4 shadow-soft">
                    <p className="text-[13.5px] font-semibold text-ink">Patient Details</p>
                    <dl className="mt-3 space-y-[10px] text-[13px]">
                      {(
                        [
                          ['MRN', r.details.mrn],
                          ['Chief Complaint', r.details.complaint],
                          ['Insurance', r.details.insurance],
                          ['Last Visit', r.details.lastVisit],
                        ] as const
                      ).map(([k, v]) => (
                        <div key={k} className="grid grid-cols-2">
                          <dt className="text-muted">{k}</dt>
                          <dd className="text-ink-2">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {r.details.vitals.map((v) => (
                        <div key={v.label} className="rounded-[12px] border border-brand-100 bg-brand-50/60 py-2 text-center">
                          <p className="text-[11px] text-muted">{v.label}</p>
                          <p className="mt-1 text-[14px] font-semibold text-ink">{v.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start gap-3 rounded-[14px] border border-line-2 bg-white p-4 shadow-soft">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                        <Sparkles size={17} />
                      </span>
                      <div>
                        <p className="text-[13.5px] font-semibold text-ink">AI Alert</p>
                        <p className="mt-0.5 text-[12.5px] text-muted">{r.details.aiAlert}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button variant="primary" size="sm" className="!h-[38px] !text-[13px]" icon={<UserCheck size={15} />} onClick={() => onRowAction('check-in', r)}>
                        Check In
                      </Button>
                      <Button variant="soft" size="sm" className="!h-[38px] !text-[13px]" icon={<Activity size={15} />} onClick={() => onRowAction('start', r)}>
                        Start Visit
                      </Button>
                      <Button size="sm" className="!h-[38px] !text-[13px]" icon={<MessageSquare size={14} />} onClick={() => onRowAction('message', r)}>
                        Message
                      </Button>
                      <Button size="sm" className="!h-[38px] !text-[13px]" icon={<Repeat2 size={14} />} onClick={() => onRowAction('reassign', r)}>
                        Reassign
                      </Button>
                      <Button variant="danger" size="sm" className="!h-[38px] !text-[13px]" icon={<XCircle size={14} />} onClick={() => onRowAction('cancel', r)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div></div>
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

export function ConflictNotice({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-2 text-[13px] text-[#965f00]">
      <AlertTriangle size={14} />
      {text}
    </span>
  )
}
