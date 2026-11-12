import { UserPhoto } from '@/components/common/UserPhoto'
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Filter,
  Home,
  Inbox,
  Megaphone,
  Receipt,
  Settings,
  Star,
  TrendingUp,
  UserPlus,
  Video,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppointmentsLineChart, RevenueBarChart } from '@/components/charts/Charts'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Dropdown } from '@/components/common/Dropdown'
import { Modal } from '@/components/common/Modal'
import { Popover } from '@/components/common/Popover'
import { MessageDialog } from '@/components/forms/MessageDialog'
import { ROUTES } from '@/constants/routes'
import { DataTable, type Column } from '@/components/tables/DataTable'
import type { ChartPoint, DashboardData, PatientReview, QuickAction, RevenueSeries, SecureMessage, TimelineAppointment, TopProvider } from '@/types'
import { cn } from '@/utils/cn'

const RANGE_OPTIONS = [
  { value: 'Today', label: 'Today' },
  { value: 'This week', label: 'This week' },
  { value: 'This month', label: 'This month' },
] as const

type Range = (typeof RANGE_OPTIONS)[number]['value']

function RangeDropdown({ value, onChange, label }: { value: Range; onChange: (v: Range) => void; label: string }) {
  return (
    <Dropdown<Range>
      variant="pill"
      label={label}
      value={value}
      onChange={onChange}
      options={[...RANGE_OPTIONS]}
      align="right"
      className="w-[104px]"
    />
  )
}

export function AppointmentsOverview({ byRange, today }: { byRange: Record<Range, ChartPoint[]>; today: ChartPoint[] }) {
  const [range, setRange] = useState<Range>('Today')
  const data = range === 'Today' ? today : byRange[range]
  return (
    <Card className="flex flex-col pb-4">
      <div className="flex items-start justify-between border-b border-line-2 px-[22px] pb-[18px] pt-[22px]">
        <div>
          <h2 className="text-[20.5px] font-semibold leading-6 tracking-[-0.01em] text-ink">Appointments Overview</h2>
          <p className="mt-1.5 text-[12.5px] text-muted">Hourly volume across all providers and locations</p>
        </div>
        <RangeDropdown value={range} onChange={setRange} label="Appointments range" />
      </div>
      <div className="mt-[18px] flex items-center gap-5 px-[22px] text-[12px] text-muted">
        {[
          ['Total', '#0cc0de'],
          ['Completed', '#1c9fe0'],
          ['In Progress', '#8a96a3'],
        ].map(([name, color]) => (
          <span key={name} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {name}
          </span>
        ))}
      </div>
      <div className="mt-3 h-[222px] px-[22px]" role="img" aria-label={`Appointments chart for ${range.toLowerCase()}`}>
        <AppointmentsLineChart data={data} fixedScale={range === 'Today'} />
      </div>
    </Card>
  )
}

const DOT: Record<TimelineAppointment['dot'], string> = {
  warn: '#f59e0b',
  brand: '#15c8e9',
  ok: '#10b981',
}

const STATUS_FILTERS = ['All', 'Waiting', 'Scheduled', 'Completed'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

export function TodayTimeline({ items }: { items: TimelineAppointment[] }) {
  const [filter, setFilter] = useState<StatusFilter>('All')
  const shown = useMemo(() => (filter === 'All' ? items : items.filter((i) => i.status === filter)), [items, filter])

  return (
    <Card className="flex flex-col p-[22px] pb-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[20.5px] font-semibold leading-7 tracking-[-0.01em] text-ink">Today&apos;s Appointment Overview</h2>
          <p className="mt-1 text-[12.5px] text-muted" aria-live="polite">
            {filter === 'All' ? '7 appointments' : `${shown.length} ${filter.toLowerCase()}`} · clinic-wide timeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover
            label="Filter by status"
            panelClassName="w-[190px]"
            renderTrigger={(p) => (
              <button type="button" {...p} aria-label="Filter appointments by status" className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-white text-muted hover:bg-tint">
                <Filter size={15} aria-hidden="true" />
              </button>
            )}
          >
            {(close) => (
              <ul>
                {STATUS_FILTERS.map((f) => (
                  <li key={f}>
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={filter === f}
                      onClick={() => {
                        setFilter(f)
                        close()
                      }}
                      className={cn('w-full rounded-[10px] px-3 py-2 text-left text-[13.5px] hover:bg-tint', filter === f ? 'font-semibold text-brand-700' : 'text-ink-2')}
                    >
                      {f === 'All' ? 'All statuses' : f}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Popover>
          <button
            type="button"
            aria-pressed={filter === 'Waiting'}
            onClick={() => setFilter((f) => (f === 'Waiting' ? 'All' : 'Waiting'))}
            className={cn('h-9 rounded-[10px] border px-4 text-[12.5px] font-medium transition', filter === 'Waiting' ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-line bg-white text-ink-2 hover:bg-tint')}
          >
            Waiting Only
          </button>
        </div>
      </div>

      <ol className="relative mt-6 space-y-[26px]">
        {shown.length === 0 && <li className="py-8 text-center text-[14px] text-muted">No {filter.toLowerCase()} appointments.</li>}
        {shown.map((a, i) => (
          <li key={a.id} className="relative grid grid-cols-[44px_30px_1fr_auto] items-center gap-x-[14px]">
            <div className="text-right leading-tight">
              <p className="text-[13px] font-bold text-ink">{a.time}</p>
              <p className="text-[10.5px] text-muted">{a.meridiem}</p>
            </div>
            <div className="relative flex justify-center self-stretch">
              {i < shown.length - 1 && <span className="absolute left-1/2 top-[18px] h-[calc(100%+22px)] w-px -translate-x-1/2 bg-line" />}
              <span className="relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-line-2">
                <span className="h-[10px] w-[10px] rounded-full" style={{ background: DOT[a.dot] }} />
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <UserPhoto name={a.patient} size={36} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">{a.patient}</p>
                <p className="truncate text-[11px] text-muted">{a.provider}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge tone={a.mode === 'Video' ? 'violet' : 'ok'} size="sm" square>
                {a.mode === 'Video' ? <Video size={11} /> : <Home size={11} />}
                {a.mode}
              </Badge>
              <Badge tone={a.status === 'Waiting' ? 'warn' : a.status === 'Completed' ? 'ok' : 'brand'} size="sm" dot square>
                {a.status}
              </Badge>
            </div>
          </li>
        ))}
      </ol>

      <Link to={ROUTES.schedule} className="mt-5 flex h-[40px] items-center justify-between rounded-[10px] border border-line-2 bg-tint px-4 text-[12.5px] font-semibold text-brand-700 hover:bg-brand-50">
        View Full Clinic Schedule
        <ChevronRight size={16} aria-hidden="true" />
      </Link>
    </Card>
  )
}

export function TopProvidersTable({ rows }: { rows: TopProvider[] }) {
  const columns: Column<TopProvider>[] = [
    {
      key: 'provider',
      header: 'Provider',
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-[10px]">
          <UserPhoto name={r.name} size={36} />
          <div>
            <p className="text-[12.5px] font-semibold leading-4 text-ink">{r.name}</p>
            <p className="text-[11px] leading-4 text-muted">{r.specialty}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'appts',
      header: 'Appointments',
      sortValue: (r) => parseInt(r.appointments, 10),
      render: (r) => (
        <span className="text-[12.5px] text-ink">
          {r.appointments.split(' (')[0]} <span className="text-muted">({r.appointments.split(' (')[1]}</span>
        </span>
      ),
    },
    { key: 'wait', header: 'Avg Wait Time', sortValue: (r) => parseInt(r.avgWait, 10), render: (r) => <span className="text-[12.5px]">{r.avgWait}</span> },
    { key: 'rev', header: 'Revenue', sortValue: (r) => Number(r.revenue.replace(/[^\d]/g, '')), render: (r) => <span className="text-[12.5px]">{r.revenue}</span> },
    {
      key: 'rating',
      header: 'Rating',
      sortValue: (r) => r.rating,
      render: (r) => (
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-warn">
          <Star size={11} fill="currentColor" />
          {r.rating.toFixed(1)}
        </span>
      ),
    },
  ]
  return (
    <Card className="overflow-hidden pb-1 pt-[22px]">
      <div className="flex items-start justify-between px-[22px]">
        <div>
          <h2 className="text-[20.5px] font-semibold leading-6 tracking-[-0.01em] text-ink">Today&apos;s Top Providers</h2>
          <p className="mt-1.5 text-[12.5px] text-faint">Ranked by completed consultations</p>
        </div>
        <Link to={ROUTES.providers} className="text-[12px] font-semibold text-brand-600 hover:underline">
          View all providers
        </Link>
      </div>
      <div className="mt-[18px] border-t border-line-2">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          minWidth={640}
          headerClassName="grid-cols-[320px_220px_176px_138px_1fr] px-[20px] py-[12px] text-[12px] font-normal text-[#4d5d70]"
          rowClassName="grid-cols-[320px_220px_176px_138px_1fr] px-[20px] py-[10px] border-t border-line-2"
        />
      </div>
    </Card>
  )
}

export function RevenueOverview({ today, byRange }: { today: RevenueSeries; byRange: Record<Range, RevenueSeries> }) {
  const [range, setRange] = useState<Range>('Today')
  const series = range === 'Today' ? today : byRange[range]
  return (
    <Card className="flex flex-col pb-4">
      <div className="flex items-start justify-between border-b border-line-2 px-[22px] pb-[18px] pt-[22px]">
        <div>
          <h2 className="text-[20.5px] font-semibold leading-6 tracking-[-0.01em] text-ink">Revenue Overview</h2>
          <p className="mt-1.5 text-[12.5px] text-muted">Collected across all payment methods</p>
        </div>
        <RangeDropdown value={range} onChange={setRange} label="Revenue range" />
      </div>
      <div className="px-[22px] pt-[18px]">
        <p className="text-[30px] font-bold leading-9 tracking-[-0.025em] text-ink">{series.total}</p>
        <p className="mt-1 text-[12px] text-muted">{series.caption}</p>
      </div>
      <div className="mt-3 h-[170px] px-[16px]" role="img" aria-label={`Revenue chart for ${range.toLowerCase()}`}>
        <RevenueBarChart data={series.bars} fixedScale={range === 'Today'} />
      </div>
    </Card>
  )
}

const QA_ICONS: Record<QuickAction['icon'], LucideIcon> = {
  calendar: Calendar,
  userPlus: UserPlus,
  receipt: Receipt,
  chart: BarChart3,
  message: Megaphone,
  settings: Settings,
}

const QA_ROUTES: Record<QuickAction['id'], string> = {
  q1: ROUTES.schedule,
  q2: ROUTES.users,
  q3: ROUTES.billing,
  q4: ROUTES.reports,
  q5: ROUTES.providers,
  q6: ROUTES.settings,
}

export function QuickActions({ items }: { items: QuickAction[] }) {
  return (
    <section aria-labelledby="qa-title">
      <h2 id="qa-title" className="text-[22px] font-semibold tracking-[-0.015em] text-ink">
        Quick Actions
      </h2>
      <p className="mt-2.5 text-[17px] text-muted">Frequently used administrative tasks</p>
      <div className="mt-6 grid gap-x-[18px] gap-y-[28px] sm:grid-cols-2 xl:grid-cols-3">
        {items.map((q) => {
          const Icon = QA_ICONS[q.icon]
          return (
            <Link
              key={q.id}
              to={QA_ROUTES[q.id] ?? ROUTES.home}
              className="flex min-h-[89px] items-center gap-[14px] rounded-[16px] border border-line-2 bg-white p-[17px] pr-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,40,60,0.09)]"
            >
              <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[14px] bg-linear-to-b from-[#26d3ef] to-[#10bfe3] text-white shadow-[0_6px_14px_rgba(21,200,233,0.3)]">
                <Icon size={23} strokeWidth={1.7} />
              </span>
              <span className="min-w-0">
                <span className="block text-[14.5px] font-bold leading-5 text-ink">{q.title}</span>
                <span className="mt-0.5 block text-[12.5px] leading-[1.35] text-muted">{q.description}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function PatientFeedback({ data, reviews }: { data: DashboardData['feedback']; reviews: PatientReview[] }) {
  const max = Math.max(...data.distribution.map((d) => d.count))
  const [open, setOpen] = useState(false)
  return (
    <Card className="p-[22px] pb-[24px]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[20px] font-bold leading-6 tracking-[-0.01em] text-ink">Patient Feedback</h2>
          <p className="mt-1.5 text-[12px] text-muted">Last 7 days · {data.reviews} reviews</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-ok-bg px-2.5 py-[4px] text-[11px] font-bold text-ok">
          <TrendingUp size={11} aria-hidden="true" />
          {data.delta}
        </span>
      </div>
      <div className="mt-[18px] flex items-center gap-6 rounded-[14px] bg-brand-50/70 px-4 py-4">
        <div>
          <p className="text-[34px] font-bold leading-none text-ink">
            {data.score}
            <span className="text-[13px] font-medium text-muted">/5</span>
          </p>
          <p className="mt-2 flex gap-0.5 text-warn" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={10} fill={n <= 4 ? 'currentColor' : 'none'} />
            ))}
          </p>
          <p className="mt-1 text-[9.5px] text-muted">Satisfaction Score</p>
        </div>
        <div className="flex-1 space-y-[9px]">
          {data.distribution.map((d) => (
            <div key={d.stars} className="flex items-center gap-2 text-[10px] text-muted">
              <span className="w-5 shrink-0">
                {d.stars} <span className="text-warn">★</span>
              </span>
              <span className="h-[4px] flex-1 overflow-hidden rounded-full bg-white">
                <span className="block h-full rounded-full bg-brand-500" style={{ width: `${(d.count / max) * 100}%` }} />
              </span>
              <span className="w-4 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-[12px] border border-line-2 p-3">
        <div className="flex items-center justify-between text-[10.5px]">
          <span className="font-bold text-ink">{data.latest.author}</span>
          <span className="flex items-center gap-1 text-[8px] text-warn">
            {'★★★★★'} <span className="text-[10px] text-muted">{data.latest.time}</span>
          </span>
        </div>
        <p className="mt-1.5 text-[10.5px] leading-[13px] text-muted">{data.latest.text}</p>
      </div>
      <button type="button" onClick={() => setOpen(true)} className="mt-[6px] flex h-[50px] w-full items-center justify-center gap-2 rounded-[12px] border border-line-2 text-[11px] font-semibold text-brand-700 hover:bg-tint">
        View All Reviews <ExternalLink size={10} aria-hidden="true" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Patient reviews" description="Synthetic demo reviews from the last 7 days." footer={<Button onClick={() => setOpen(false)}>Close</Button>}>
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-[12px] border border-line-2 p-4">
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="font-bold text-ink">{r.author}</span>
                <span className="text-muted">
                  <span className="text-warn" aria-label={`${r.stars} out of 5 stars`}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span> · {r.time}
                </span>
              </div>
              <p className="mt-1.5 text-[13.5px] leading-5 text-muted">{r.text}</p>
            </li>
          ))}
        </ul>
      </Modal>
    </Card>
  )
}

export function SecureMessages({ data }: { data: DashboardData['messages'] }) {
  const [inbox, setInbox] = useState(false)
  const [reply, setReply] = useState<SecureMessage | null>(null)
  return (
    <Card className="flex flex-col p-[22px] pb-[24px]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-brand-50 text-brand-600">
            <Inbox size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[20px] font-bold leading-6 tracking-[-0.01em] text-ink">Secure Messages</h2>
            <p className="mt-0.5 text-[12.5px] text-muted">{data.unread} unread</p>
          </div>
        </div>
        <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-bad text-[10px] font-bold text-white" aria-label={`${data.unread} unread messages`}>
          {data.unread}
        </span>
      </div>
      <ul className="mt-[14px] space-y-3">
        {data.items.map((m) => (
          <li key={m.id} className="rounded-[12px] border border-line-2 px-3 py-[10px]">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="flex items-center gap-2 font-bold text-ink">
                <span className="h-[7px] w-[7px] rounded-full bg-brand-500" aria-hidden="true" />
                {m.from}
              </span>
              <span className="text-[9px] text-muted">{m.time}</span>
            </div>
            <p className="mt-1 text-[10.5px] leading-[14px] text-muted">{m.preview}</p>
            <span className={cn('mt-1.5 inline-flex rounded-md px-1.5 py-0.5 text-[8.5px] font-bold tracking-wider', m.tag === 'PROVIDER' ? 'bg-brand-50 text-brand-700' : 'bg-info-bg text-info')}>{m.tag}</span>
          </li>
        ))}
      </ul>
      <Button variant="primary" fullWidth className="mt-[16px] !h-[47px] !rounded-[12px] !bg-linear-to-b !from-[#3fcdf5] !to-[#25bdf0] !text-[11.5px]" icon={<Inbox size={13} />} iconRight={<ExternalLink size={10} />} onClick={() => setInbox(true)}>
        Open Inbox
      </Button>

      <Modal open={inbox} onClose={() => setInbox(false)} title="Secure inbox" description="Synthetic demo messages." footer={<Button onClick={() => setInbox(false)}>Close</Button>}>
        <ul className="space-y-3">
          {data.items.map((m) => (
            <li key={m.id} className="rounded-[12px] border border-line-2 p-4">
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="font-bold text-ink">{m.from}</span>
                <span className="text-muted">{m.time}</span>
              </div>
              <p className="mt-1.5 text-[13.5px] leading-5 text-muted">{m.preview}</p>
              <Button size="sm" className="mt-3 !h-[34px] !text-[13px]" onClick={() => { setInbox(false); setReply(m) }}>
                Reply
              </Button>
            </li>
          ))}
        </ul>
      </Modal>
      <MessageDialog open={reply !== null} recipient={reply?.from ?? ''} onClose={() => setReply(null)} />
    </Card>
  )
}
