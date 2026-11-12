import { UserPhoto } from '@/components/common/UserPhoto'
import { AlertTriangle, Bell, CalendarDays, Clock4, CircleHelp, Layers, MessageSquare, Search, Sparkles, UserPlus, BarChart3, Video } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatCard } from '@/components/cards/StatCard'
import { Sparkline } from '@/components/charts/Charts'
import { Badge, Chip } from '@/components/common/Badge'
import { Button, IconButton } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Dropdown } from '@/components/common/Dropdown'
import { Modal } from '@/components/common/Modal'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/common/States'
import { useToast } from '@/components/common/Toast'
import { TextField } from '@/components/forms/Fields'
import { useAsync } from '@/hooks/useAsync'
import { doctorService } from '@/services/doctorService'
import type { ProviderCardData, ProviderInsight, ProviderRole, ProviderStatus, Tone } from '@/types'
import { downloadFile, toCsv } from '@/utils/download'
import { useNavigate, Link } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import { FormDialog } from '@/components/forms/FormDialog'
import { MessageDialog } from '@/components/forms/MessageDialog'
import { SelectField } from '@/components/forms/SelectFields'
import { NotificationsMenu } from '@/features/notifications/NotificationsMenu'
import { useZodForm } from '@/hooks/useZodForm'
import { inviteSchema } from '@/schemas/common'
import { ROUTES } from '@/constants/routes'
import { z } from 'zod'

const ALL = 'all'
const ROLES: ('All Providers' | ProviderRole)[] = ['All Providers', 'Doctors', 'Nurse Practitioners', 'Physician Assistants', 'Therapists', 'Nurses / MAs']

const STATUS_TONE: Record<ProviderStatus, Tone> = {
  'Online & Available': 'ok',
  'In a Visit': 'warn',
  Offline: 'neutral',
  'Running Late': 'bad',
}
const STATUS_DOT: Record<ProviderStatus, string> = {
  'Online & Available': '#10b981',
  'In a Visit': '#f59e0b',
  Offline: '#9aa8b7',
  'Running Late': '#ef4444',
}

const INSIGHT_ICON = { alert: AlertTriangle, sparkle: Sparkles, clock: Clock4 } as const

function InsightTile({ item, onAction }: { item: ProviderInsight; onAction: (i: ProviderInsight) => void }) {
  const Icon = INSIGHT_ICON[item.icon]
  return (
    <div className="flex flex-col justify-between rounded-[16px] border border-brand-100 bg-linear-to-br from-brand-50 to-white p-[15px]">
      <div className="flex items-start gap-3">
        <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
          <Icon size={14} />
        </span>
        <div>
          <p className="text-[14px] font-semibold text-ink">{item.title}</p>
          <p className="mt-0.5 text-[13.5px] text-muted">{item.body}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAction(item)}
        className="mt-5 h-[42px] self-start rounded-full bg-brand-100/80 px-5 text-[15.5px] font-semibold text-brand-700 hover:bg-brand-200/70"
      >
        {item.action}
      </button>
    </div>
  )
}

function ProviderCard({ p, onSchedule, onMessage, onProfile }: { p: ProviderCardData; onSchedule: (p: ProviderCardData) => void; onMessage: (p: ProviderCardData) => void; onProfile: (p: ProviderCardData) => void }) {
  return (
    <Card className="flex min-w-0 flex-col overflow-hidden">
      <div className="flex gap-4 p-[14px] pb-3">
        <div className="relative shrink-0 self-start">
          <UserPhoto name={p.name} size={70} shape="rounded" status={STATUS_DOT[p.status]} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[17px] font-bold text-ink">{p.name}</h3>
              <p className="mt-1 text-[13.5px] text-ink-2">{p.specialty}</p>
              <p className="mt-0.5 text-[12.5px] text-muted">{p.credentials}</p>
            </div>
            <Badge tone={STATUS_TONE[p.status]} size="sm" className="shrink-0 !text-[13px]">
              {p.status}
            </Badge>
          </div>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-muted">
            <span className="flex items-center gap-1.5"><CalendarDays size={13} className="text-brand-600" />{p.today}</span>
            <span className="flex items-center gap-1.5"><Video size={13} className="text-brand-600" />{p.modes}</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-muted">
            <Clock4 size={13} className="text-brand-600" />
            {p.next}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-4 border-y border-line-2">
        {(
          [
            ['Avg Wait', p.avgWait],
            ['Rating', `★ ${p.rating}`],
            ['Waiting', p.waiting],
            ['Revenue', p.revenue],
          ] as const
        ).map(([k, v], i) => (
          <div key={k} className={i ? 'border-l border-line-2 px-3 py-2.5' : 'px-3 py-2.5'}>
            <dt className="text-[12.5px] text-muted">{k}</dt>
            <dd className="mt-1 text-[15.5px] font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="grid flex-1 grid-cols-2 items-end gap-4 p-[14px]">
        <div className="self-center">
          <p className="text-[13.5px] text-ink-2">
            Performance score <span className="font-bold text-ink">{p.score}/100</span>
          </p>
          <div className="mt-2.5">
            <Sparkline data={p.trend} />
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="flex gap-2.5">
            <Button variant="soft" size="sm" className="!h-[40px] flex-1 !px-3 !text-[14.5px]" icon={<CalendarDays size={13} />} onClick={() => onSchedule(p)}>
              View Schedule
            </Button>
            <Button size="sm" className="!h-[40px] flex-1 !px-3 !text-[14.5px]" icon={<MessageSquare size={13} />} onClick={() => onMessage(p)}>
              Message
            </Button>
          </div>
          <Button variant="primary" size="sm" fullWidth className="!h-[42px] !text-[15px]" onClick={() => onProfile(p)}>
            View Profile
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function ProvidersPage() {
  const { data, loading, error, reload } = useAsync(doctorService.get)
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [roleFilter, setRoleFilter] = useState(ALL)
  const [chip, setChip] = useState<(typeof ROLES)[number]>('All Providers')
  const [invite, setInvite] = useState(false)
  const [bulk, setBulk] = useState(false)
  const [messageTo, setMessageTo] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProviderCardData | null>(null)
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (data?.providers ?? []).filter((p) => {
      if (location !== ALL && p.location !== location) return false
      if (status !== ALL && p.status !== status) return false
      if (roleFilter !== ALL && p.role !== roleFilter) return false
      if (chip !== 'All Providers' && p.role !== chip) return false
      return !q || [p.name, p.specialty, p.location].some((v) => v.toLowerCase().includes(q))
    })
  }, [data, query, location, status, roleFilter, chip])

  if (loading) return <PageSkeleton />
  if (error || !data) return <ErrorState message={error ?? 'Unable to load providers'} onRetry={reload} />

  const locations = [...new Set(data.providers.map((p) => p.location))]
  const opts = (label: string, values: string[]) => [{ value: ALL, label }, ...values.map((v) => ({ value: v, label: v }))]

  return (
    <div className="space-y-[22px]" style={{ zoom: 0.84 }}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight tracking-[-0.025em] text-ink">Providers</h1>
          <p className="mt-2 text-[15.5px] text-muted">Manage clinic providers and monitor performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm" className="!h-[42px] !text-[15px]" icon={<UserPlus size={15} />} onClick={() => setInvite(true)}>
            Invite Provider
          </Button>
          <Button size="sm" className="!h-[42px] !text-[15px]" icon={<Layers size={15} />} onClick={() => setBulk(true)}>
            Bulk Slot Generation
          </Button>
          <Button size="sm" className="!h-[42px] !text-[15px]" icon={<BarChart3 size={15} />} onClick={() => {
            downloadFile('clinic-performance.csv', toCsv(['Provider', 'Specialty', 'Status', 'Avg wait', 'Rating', 'Revenue', 'Score'], data.providers.map((p) => [p.name, p.specialty, p.status, p.avgWait, p.rating, p.revenue, p.score])))
            notify('Report exported as clinic-performance.csv')
          }}>
            Clinic Performance Report
          </Button>
          <IconButton label="Search" className="!h-[36px] !w-[36px] !rounded-full" onClick={() => document.getElementById('provider-search')?.focus()}>
            <Search size={15} />
          </IconButton>
          <NotificationsMenu
            kind="notifications"
            renderTrigger={(p, unread) => (
              <button type="button" {...p} aria-label={unread ? `Alerts, ${unread} unread` : 'Alerts'} className="relative flex h-[36px] w-[36px] items-center justify-center rounded-full border border-line bg-white text-ink-2 shadow-soft hover:bg-tint">
                <Bell size={15} aria-hidden="true" />
                {unread > 0 && <span className="absolute right-1 top-1 h-[7px] w-[7px] rounded-full bg-bad" aria-hidden="true" />}
              </button>
            )}
          />
          <Link to={ROUTES.help} aria-label="Help center" className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-line bg-white text-ink-2 shadow-soft hover:bg-tint">
            <CircleHelp size={15} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="grid-stats-6 gap-[22px]">
        {data.stats.map((s) => (
          <StatCard key={s.id} metric={s} variant="compact" />
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-[16px] pb-[14px]">
          <label className="flex h-[42px] min-w-[240px] flex-1 items-center gap-3 rounded-[12px] border border-line bg-white px-4">
            <Search size={16} className="text-ink-2" />
            <span className="sr-only">Search providers</span>
            <input
              id="provider-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, speciality or location..."
              className="h-full flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
            />
          </label>
          <Dropdown variant="pill" label="Location" value={location} onChange={setLocation} options={opts('All Locations', locations)} className="w-[172px] [&>button]:!h-[42px] [&>button]:!text-[14.5px]" />
          <Dropdown variant="pill" label="Status" value={status} onChange={setStatus} options={opts('All Statuses', ['Online & Available', 'In a Visit', 'Offline', 'Running Late'])} className="w-[172px] [&>button]:!h-[42px] [&>button]:!text-[14.5px]" />
          <Dropdown variant="pill" label="Role" value={roleFilter} onChange={setRoleFilter} options={opts('All Roles', ROLES.slice(1))} className="w-[148px] [&>button]:!h-[42px] [&>button]:!text-[14.5px]" />
        </div>
        <div className="flex flex-wrap gap-3 border-t border-line-2 px-[16px] py-[14px]">
          {ROLES.map((r) => (
            <Chip key={r} active={chip === r} onClick={() => setChip(r)} className="!h-[40px] !px-[18px] !text-[14.5px]">
              {r}
            </Chip>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-start justify-between p-[20px] pb-4">
          <div>
            <h2 className="text-[17px] font-semibold text-ink">AI Insights</h2>
            <p className="mt-1.5 text-[13px] text-muted">Operational signals across your provider roster</p>
          </div>
          <Badge tone="brand" size="sm" className="!text-[13px]">
            {data.insights.length} new
          </Badge>
        </div>
        <div className="grid gap-[18px] border-t border-line-2 p-[16px] md:grid-cols-2 xl:grid-cols-4">
          {data.insights.map((i) => (
            <InsightTile key={i.id} item={i} onAction={(item) => (item.to ? navigate(item.to) : item.messageTo ? setMessageTo(item.messageTo) : undefined)} />
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState title="No providers found" description="Adjust your search or filters to see more providers." />
        </Card>
      ) : (
        <div className="grid-cards-3 gap-[18px]">
          {filtered.map((p) => (
            <ProviderCard key={p.id} p={p} onSchedule={(x) => navigate(`/clinic-schedule?provider=${encodeURIComponent(x.name)}`)} onMessage={(x) => setMessageTo(x.name)} onProfile={setProfile} />
          ))}
        </div>
      )}

      <InviteProviderModal open={invite} onClose={() => setInvite(false)} onDone={(n) => notify(`Invitation to ${n} queued (demo: no email is sent)`)} />
      <MessageDialog open={messageTo !== null} recipient={messageTo ?? ''} onClose={() => setMessageTo(null)} />
      <BulkSlotDialog open={bulk} providers={data.providers.map((p) => p.name)} onClose={() => setBulk(false)} onDone={(msg) => notify(msg)} />
      <ProfileDialog provider={profile} onClose={() => setProfile(null)} onMessage={(n) => { setProfile(null); setMessageTo(n) }} />
    </div>
  )
}

function InviteProviderModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (name: string) => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useZodForm(inviteSchema, { defaultValues: { name: '', email: '' } })
  const submit = handleSubmit(async (v) => {
    await new Promise((r) => setTimeout(r, 400))
    onDone(v.name)
    reset()
    onClose()
  })
  return (
    <FormDialog open={open} title="Invite provider" description="Send an invitation to join Northstar Clinic." submitLabel="Send invite" busy={isSubmitting} onClose={onClose} onSubmit={submit}>
      <TextField label="Full name" placeholder="Dr. Jane Doe" error={errors.name?.message} {...register('name')} />
      <TextField label="Work email" type="email" placeholder="jane@northstarclinic.com" error={errors.email?.message} {...register('email')} />
    </FormDialog>
  )
}

const bulkSchema = z.object({
  provider: z.string().min(1, 'Select a provider'),
  startDate: z.string().min(1, 'Choose a start date'),
  days: z.coerce.number<number>({ message: 'Enter a number of days' }).int('Use a whole number').min(1, 'At least 1 day').max(30, 'At most 30 days'),
  slotMinutes: z.enum(['15', '20', '30', '45', '60']),
})

function BulkSlotDialog({ open, providers, onClose, onDone }: { open: boolean; providers: string[]; onClose: () => void; onDone: (message: string) => void }) {
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useZodForm(bulkSchema, { defaultValues: { provider: providers[0] ?? '', startDate: '', days: 5, slotMinutes: '30' } })
  const submit = handleSubmit(async (v) => {
    await new Promise((r) => setTimeout(r, 400))
    const perDay = Math.floor((8 * 60) / Number(v.slotMinutes))
    onDone(`${v.days * perDay} slots prepared for ${v.provider} (demo: not saved)`)
    reset()
    onClose()
  })
  return (
    <FormDialog open={open} title="Bulk slot generation" description="Create appointment slots for a provider across several days (demo data)." submitLabel="Generate slots" busy={isSubmitting} onClose={onClose} onSubmit={submit}>
      <Controller control={control} name="provider" render={({ field }) => <SelectField label="Provider" options={providers} value={field.value} onChange={field.onChange} error={errors.provider?.message} />} />
      <TextField label="Start date" type="date" error={errors.startDate?.message} {...register('startDate')} />
      <TextField label="Number of days" type="number" min={1} max={30} error={errors.days?.message} {...register('days')} />
      <Controller control={control} name="slotMinutes" render={({ field }) => <SelectField label="Slot length (minutes)" options={['15', '20', '30', '45', '60']} value={field.value} onChange={field.onChange} />} />
    </FormDialog>
  )
}

function ProfileDialog({ provider, onClose, onMessage }: { provider: ProviderCardData | null; onClose: () => void; onMessage: (name: string) => void }) {
  return (
    <Modal
      open={provider !== null}
      onClose={onClose}
      title={provider?.name ?? ''}
      description={provider ? `${provider.specialty} · ${provider.credentials}` : ''}
      footer={
        <>
          <Button onClick={onClose}>Close</Button>
          {provider && <Button variant="primary" onClick={() => onMessage(provider.name)}>Message</Button>}
        </>
      }
    >
      {provider && (
        <div className="flex gap-5">
          <UserPhoto name={provider.name} size={88} shape="rounded" status={STATUS_DOT[provider.status]} />
          <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
            {([
              ['Status', provider.status],
              ['Location', provider.location],
              ['Rating', provider.rating],
              ['Avg wait', provider.avgWait],
              ['Revenue today', provider.revenue],
              ['Performance', `${provider.score}/100`],
            ] as const).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] text-muted">{k}</dt>
                <dd className="font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Modal>
  )
}
