import { useSyncedState } from '@/hooks/useSyncedState'
import { ChevronLeft, ChevronRight, Clock3, MessageSquare, Plus, Printer, Repeat2, Search, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { StatCard } from '@/components/cards/StatCard'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Dropdown } from '@/components/common/Dropdown'
import { ErrorState, PageSkeleton } from '@/components/common/States'
import { useToast } from '@/components/common/Toast'
import { Toggle } from '@/components/common/Toggle'
import { MessageDialog } from '@/components/forms/MessageDialog'
import { useAsync } from '@/hooks/useAsync'
import { appointmentService } from '@/services/appointmentService'
import type { ScheduleAlert, ScheduleRow, VisitType } from '@/types'
import { cn } from '@/utils/cn'
import { AddAppointmentModal } from './AddAppointmentModal'
import { CalendarViews } from './CalendarViews'
import { ReassignDialog, RescheduleDialog } from './ScheduleDialogs'
import { AlertsCard, QuickBook, WaitingQueue } from './ScheduleRail'
import { ConflictNotice, ScheduleTable, type RowActionKind } from './ScheduleTable'

const ALL = 'all'
const VIEWS = ['List View', 'Week', 'Month'] as const
type View = (typeof VIEWS)[number]

const unique = (values: string[]) => [...new Set(values)]

type Dialog =
  | { kind: 'add' }
  | { kind: 'message'; recipient: string }
  | { kind: 'reassign'; ids: string[] }
  | { kind: 'reschedule'; ids: string[] }
  | { kind: 'cancel'; ids: string[] }
  | null

export default function SchedulePage() {
  const { data, loading, error, reload } = useAsync(appointmentService.get)
  const notify = useToast()
  const [params] = useSearchParams()

  const [rows, setRows] = useSyncedState<ScheduleRow[]>(data, () => data?.rows ?? [])
  const [alerts, setAlerts] = useSyncedState<ScheduleAlert[]>(data, () => data?.alerts ?? [])
  const [view, setView] = useState<View>('List View')
  const [day, setDay] = useState('today')
  const [query, setQuery] = useState('')
  const [provider, setProvider] = useState(params.get('provider') ?? ALL)
  const [location, setLocation] = useState(ALL)
  const [visit, setVisit] = useState(ALL)
  const [status, setStatus] = useState(params.get('status') ?? ALL)
  const [showOpen, setShowOpen] = useState(true)
  const [expanded, setExpanded] = useState<string | null>('s1')
  const [selected, setSelected] = useSyncedState<Set<string>>(data, () => (data ? new Set(['s3', 's4', 's7']) : new Set()))
  const [dialog, setDialog] = useState<Dialog>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (!showOpen && r.isOpenSlot) return false
      if (provider !== ALL && r.provider !== provider) return false
      if (visit !== ALL && r.type !== visit) return false
      if (status !== ALL && r.status !== status) return false
      if (location !== ALL && !r.room.startsWith(location)) return false
      if (!q) return true
      return [r.title, r.mrn ?? '', r.provider, r.subtitle].some((v) => v.toLowerCase().includes(q))
    })
  }, [rows, query, provider, visit, status, location, showOpen])

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [setSelected])

  if (loading) return <PageSkeleton cards={5} />
  if (error || !data) return <ErrorState message={error ?? 'Unable to load schedule'} onRetry={reload} />

  const providerNames = unique(data.rows.map((r) => r.provider))
  const clearFilters = () => {
    setProvider(ALL)
    setLocation(ALL)
    setVisit(ALL)
    setStatus(ALL)
    setQuery('')
    setShowOpen(true)
  }

  const selectedIds = [...selected].filter((id) => rows.some((r) => r.id === id))
  const selectedCount = selectedIds.length
  const requireSelection = (open: (ids: string[]) => Dialog) => {
    if (!selectedCount) return notify('Select at least one appointment first')
    setDialog(open(selectedIds))
  }

  const patchRows = (ids: string[], patch: Partial<ScheduleRow>) =>
    setRows((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, ...patch } : r)))

  const addRow = (input: { patient: string; provider: string; visitType: string; time?: string }) => {
    const specialty = data.rows.find((r) => r.provider === input.provider)?.specialty ?? ''
    const row: ScheduleRow = {
      id: `n-${Date.now()}`,
      time: input.time ?? '12:00 PM',
      title: input.patient,
      subtitle: 'New appointment',
      provider: input.provider,
      specialty,
      type: input.visitType as VisitType,
      status: 'Confirmed',
      room: input.visitType === 'In-Person' ? 'Room 1' : '—',
    }
    setRows((prev) => [...prev, row])
    notify(`Appointment booked for ${input.patient} (demo data)`)
  }

  const onRowAction = (kind: RowActionKind, row: ScheduleRow) => {
    if (kind === 'check-in') {
      patchRows([row.id], { status: 'Checked-In' })
      notify(`${row.title} checked in`)
    } else if (kind === 'start') {
      patchRows([row.id], { status: 'In Progress' })
      notify(`Visit started for ${row.title}`)
    } else if (kind === 'message') setDialog({ kind: 'message', recipient: row.title })
    else if (kind === 'reassign') setDialog({ kind: 'reassign', ids: [row.id] })
    else setDialog({ kind: 'cancel', ids: [row.id] })
  }

  const resolveAlert = (alert: ScheduleAlert) => {
    if (alert.action === 'Reassign') setProvider(providerNames[0] ?? ALL)
    if (alert.action === 'Promote') setStatus('Open Slot')
    setAlerts((prev) => prev.filter((a) => a.id !== alert.id))
    notify(`${alert.action ?? 'Alert'} applied (demo)`)
  }

  const dayIndex = data.days.findIndex((d) => d.id === day)
  const shiftDay = (delta: number) => {
    const next = data.days[dayIndex + delta]
    if (next) setDay(next.id)
  }

  const filterOptions = (label: string, values: string[]) => [{ value: ALL, label }, ...values.map((v) => ({ value: v, label: v }))]

  return (
    <div className="-mt-5 space-y-[22px] sm:px-1.5" style={{ zoom: 0.88 }}>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[31px] font-bold leading-tight tracking-[-0.025em] text-ink">Clinic Schedule</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">View and manage all clinic appointments.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-[40px] w-full items-center gap-3 rounded-full border border-line bg-white px-4 shadow-soft sm:w-[330px]">
            <Search size={17} className="text-ink-2" aria-hidden="true" />
            <span className="sr-only">Search appointments</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient, provider or MRN..." className="h-full flex-1 bg-transparent text-[15.5px] outline-none placeholder:text-muted" />
          </label>
          <button type="button" aria-label="Print schedule" onClick={() => window.print()} className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-line bg-white text-ink-2 shadow-soft hover:bg-tint">
            <Printer size={16} aria-hidden="true" />
          </button>
          <Button variant="primary" className="!h-[44px] !rounded-full !px-6 !text-[15.5px]" icon={<Plus size={16} />} onClick={() => setDialog({ kind: 'add' })}>
            Add Appointment
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Calendar view" className="inline-flex rounded-full border border-line-2 bg-white p-1 shadow-soft">
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn('h-[36px] rounded-full px-[20px] text-[14.5px] font-medium transition', view === v ? 'bg-linear-to-b from-[#22d0ee] to-[#0cbfe3] text-white shadow-brand' : 'text-ink-2 hover:bg-tint')}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex max-w-full items-center gap-1 rounded-full border border-line-2 bg-white px-3 py-1.5 shadow-soft">
          <button type="button" aria-label="Previous day" disabled={dayIndex <= 0} onClick={() => shiftDay(-1)} className="rounded-full p-1.5 text-ink-2 hover:bg-tint disabled:opacity-40">
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <div className="scrollbar-thin flex items-center gap-1 overflow-x-auto">
            {data.days.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={day === d.id}
                onClick={() => setDay(d.id)}
                className={cn('h-[36px] shrink-0 whitespace-nowrap rounded-full px-[16px] text-[15px] transition', day === d.id ? 'bg-linear-to-b from-[#22d0ee] to-[#0cbfe3] font-semibold text-white shadow-brand' : 'text-ink-2 hover:bg-tint')}
              >
                {d.label} <span className={day === d.id ? 'text-white/90' : 'text-muted'}>({d.count})</span>
              </button>
            ))}
          </div>
          <button type="button" aria-label="Next day" disabled={dayIndex >= data.days.length - 1} onClick={() => shiftDay(1)} className="rounded-full p-1.5 text-ink-2 hover:bg-tint disabled:opacity-40">
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid-stats-5 gap-[18px]">
        {data.stats.map((s) => (
          <StatCard key={s.id} metric={s} variant="compact" />
        ))}
      </div>

      {view !== 'List View' && (
        <CalendarViews
          view={view}
          days={data.days}
          activeId={day}
          onPick={(id) => {
            setDay(id)
            setView('List View')
          }}
        />
      )}

      <div className="grid items-start gap-[22px] xl:grid-cols-[minmax(0,1fr)_365px]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-[16px]">
            <Dropdown variant="pill" label="Filter by provider" value={provider} onChange={setProvider} options={filterOptions('All Providers', providerNames)} className="w-[158px] [&>button]:!text-[14px]" />
            <Dropdown variant="pill" label="Filter by location" value={location} onChange={setLocation} options={filterOptions('All Locations', ['Room 1', 'Room 2', 'Room 3'])} className="w-[158px] [&>button]:!text-[14px]" />
            <Dropdown variant="pill" label="Filter by visit type" value={visit} onChange={setVisit} options={filterOptions('All Visit Types', ['In-Person', 'Video Visit', 'Phone Call'])} className="w-[166px] [&>button]:!text-[14px]" />
            <Dropdown variant="pill" label="Filter by status" value={status} onChange={setStatus} options={filterOptions('All Status', ['Checked-In', 'Open Slot', 'Waiting', 'Confirmed', 'In Progress'])} className="w-[136px] [&>button]:!text-[14px]" />
            <span className="flex h-[38px] items-center gap-3 rounded-full border border-line bg-white px-4 text-[14px] font-medium text-ink shadow-soft">
              Show Open Slots
              <Toggle checked={showOpen} onChange={setShowOpen} label="Show open slots" size="sm" />
            </span>
            <button type="button" onClick={clearFilters} className="ml-auto text-[14.5px] font-semibold text-brand-700 hover:underline">
              Clear All
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-y border-line-2 bg-[#fafdfe] px-[16px] py-3">
            <Badge tone="brand" size="sm" className="!px-3 !py-[5px]">
              {selectedCount} selected
            </Badge>
            <span className="text-[13px] text-muted">Bulk actions:</span>
            <Button variant="soft" size="sm" className="!h-[40px] !text-[14.5px]" icon={<MessageSquare size={14} />} onClick={() => requireSelection(() => ({ kind: 'message', recipient: `${selectedCount} patient${selectedCount > 1 ? 's' : ''}` }))}>
              Message
            </Button>
            <Button variant="soft" size="sm" className="!h-[40px] !text-[14.5px]" icon={<Repeat2 size={14} />} onClick={() => requireSelection((ids) => ({ kind: 'reassign', ids }))}>
              Reassign
            </Button>
            <Button variant="soft" size="sm" className="!h-[40px] !text-[14.5px]" icon={<Clock3 size={14} />} onClick={() => requireSelection((ids) => ({ kind: 'reschedule', ids }))}>
              Reschedule
            </Button>
            <Button variant="danger" size="sm" className="!h-[40px] !text-[14.5px]" icon={<Trash2 size={14} />} onClick={() => requireSelection((ids) => ({ kind: 'cancel', ids }))}>
              Cancel
            </Button>
            <span className="ml-auto">
              <ConflictNotice text={data.conflict} />
            </span>
          </div>

          <ScheduleTable rows={filtered} expandedId={expanded} onToggle={(id) => setExpanded((cur) => (cur === id ? null : id))} selected={selected} onSelect={toggleSelect} onRowAction={onRowAction} />
          <div className="h-8" />
        </Card>

        <div className="space-y-[18px]">
          <AlertsCard alerts={alerts} onAction={resolveAlert} />
          <WaitingQueue entries={data.waiting} />
          <QuickBook providers={providerNames} onBook={(b) => addRow({ patient: b.patient, provider: b.provider, visitType: b.visitType })} />
        </div>
      </div>

      <AddAppointmentModal open={dialog?.kind === 'add'} providers={providerNames} onClose={() => setDialog(null)} onSubmit={(v) => addRow({ patient: v.patient, provider: v.provider, visitType: v.visitType, time: v.timeLabel })} />
      <MessageDialog open={dialog?.kind === 'message'} recipient={dialog?.kind === 'message' ? dialog.recipient : ''} onClose={() => setDialog(null)} />
      <ReassignDialog
        open={dialog?.kind === 'reassign'}
        count={dialog?.kind === 'reassign' ? dialog.ids.length : 0}
        providers={providerNames}
        onClose={() => setDialog(null)}
        onSubmit={(p) => {
          if (dialog?.kind !== 'reassign') return
          const specialty = data.rows.find((r) => r.provider === p)?.specialty ?? ''
          patchRows(dialog.ids, { provider: p, specialty })
          notify(`Reassigned to ${p} (demo data)`)
        }}
      />
      <RescheduleDialog
        open={dialog?.kind === 'reschedule'}
        count={dialog?.kind === 'reschedule' ? dialog.ids.length : 0}
        onClose={() => setDialog(null)}
        onSubmit={(t) => {
          if (dialog?.kind !== 'reschedule') return
          patchRows(dialog.ids, { time: t })
          notify(`Rescheduled to ${t} (demo data)`)
        }}
      />
      <ConfirmDialog
        open={dialog?.kind === 'cancel'}
        danger
        title="Cancel appointments?"
        message={`${dialog?.kind === 'cancel' ? dialog.ids.length : 0} appointment(s) will be removed from the schedule. In a live system the patient would be notified.`}
        confirmLabel="Cancel appointments"
        cancelLabel="Keep"
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          if (dialog?.kind !== 'cancel') return
          const ids = dialog.ids
          setRows((prev) => prev.filter((r) => !ids.includes(r.id)))
          setSelected((prev) => new Set([...prev].filter((id) => !ids.includes(id))))
          setDialog(null)
          notify(`Cancelled ${ids.length} appointment${ids.length > 1 ? 's' : ''} (demo data)`)
        }}
      />
    </div>
  )
}
