import { Card } from '@/components/common/Card'
import type { DayTab } from '@/types'
import { cn } from '@/utils/cn'

interface WeekViewProps {
  days: DayTab[]
  activeId: string
  onPick: (id: string) => void
}

/** Week overview: one tile per day with appointment volume. Picking a day opens it in the list. */
export function WeekView({ days, activeId, onPick }: WeekViewProps) {
  const max = Math.max(...days.map((d) => d.count), 1)
  return (
    <Card className="p-5">
      <h2 className="text-[18px] font-semibold text-ink">This week</h2>
      <p className="mt-1 text-[13px] text-muted">Select a day to open its appointment list.</p>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => onPick(d.id)}
              aria-pressed={d.id === activeId}
              className={cn('w-full rounded-[14px] border p-4 text-left transition hover:bg-tint', d.id === activeId ? 'border-brand-300 bg-brand-50' : 'border-line-2 bg-white')}
            >
              <span className="block text-[13px] font-semibold text-ink">{d.label}</span>
              <span className="mt-2 block text-[26px] font-bold text-ink">{d.count}</span>
              <span className="block text-[12px] text-muted">appointments</span>
              <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-[#eef3f6]" aria-hidden="true">
                <span className="block h-full rounded-full bg-brand-500" style={{ width: `${(d.count / max) * 100}%` }} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface MonthViewProps {
  days: DayTab[]
  onPick: (id: string) => void
}

/** Month overview. Only days that are loaded in the demo data are selectable. */
export function MonthView({ days, onPick }: MonthViewProps) {
  // Demo calendar: a 5-week grid whose last row holds the loaded days (Mon 27 … Sun 2).
  const cells = Array.from({ length: 35 }, (_, i) => i)
  const loadedStart = 28
  const labelFor = (i: number) => (i < loadedStart ? ((i + 3) % 30) + 1 : days[i - loadedStart] ? days[i - loadedStart]?.label.replace(/\D+/g, '') ?? '' : '')
  return (
    <Card className="p-5">
      <h2 className="text-[18px] font-semibold text-ink">Month overview</h2>
      <p className="mt-1 text-[13px] text-muted">Only the current week is loaded in demo data. Other days show no appointment data.</p>
      <div role="grid" aria-label="Month calendar" className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((w) => (
          <div key={w} role="columnheader" className="pb-1 text-center text-[12px] font-semibold uppercase tracking-wider text-muted">
            {w}
          </div>
        ))}
        {cells.map((i) => {
          const day = i >= loadedStart ? days[i - loadedStart] : undefined
          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              disabled={!day}
              onClick={() => day && onPick(day.id)}
              aria-label={day ? `${day.label}, ${day.count} appointments` : `Day ${labelFor(i)}, no data loaded`}
              className={cn('flex h-[64px] flex-col items-start rounded-[10px] border p-2 text-left text-[13px] transition', day ? 'border-brand-200 bg-brand-50 hover:bg-brand-100' : 'border-line-2 bg-white text-muted opacity-70')}
            >
              <span className="font-semibold">{labelFor(i)}</span>
              {day && <span className="mt-auto text-[11px] text-brand-700">{day.count} appts</span>}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

interface CalendarViewsProps {
  view: 'List View' | 'Week' | 'Month'
  days: DayTab[]
  activeId: string
  onPick: (id: string) => void
}

export function CalendarViews({ view, days, activeId, onPick }: CalendarViewsProps) {
  if (view === 'Week') return <WeekView days={days} activeId={activeId} onPick={onPick} />
  if (view === 'Month') return <MonthView days={days} onPick={onPick} />
  return null
}
