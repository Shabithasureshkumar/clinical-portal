import { useSyncedState } from '@/hooks/useSyncedState'
import { UserPhoto } from '@/components/common/UserPhoto'
import { ArrowRight, BarChart3, BrainCircuit, CalendarDays, Download, FileText, Filter, Play, Save, Share2, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatCard } from '@/components/cards/StatCard'
import { GradientBars, MixDonut } from '@/components/charts/Charts'
import { Button } from '@/components/common/Button'
import { Card, CardHeader, CardLink } from '@/components/common/Card'
import { Dropdown } from '@/components/common/Dropdown'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { ProgressBar } from '@/components/common/ProgressBar'
import { ErrorState, PageSkeleton } from '@/components/common/States'
import { useToast } from '@/components/common/Toast'
import { TextField } from '@/components/forms/Fields'
import { FormDialog } from '@/components/forms/FormDialog'
import { ROUTES } from '@/constants/routes'
import { useZodForm } from '@/hooks/useZodForm'
import { reportNameSchema } from '@/schemas/common'
import { copyText, downloadFile, toCsv } from '@/utils/download'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { useAsync } from '@/hooks/useAsync'
import { reportService } from '@/services/reportService'
import type { ProviderScore, SavedReport } from '@/types'

const ALL = 'all'
const DATE_OPTIONS = ['Oct 01 — Oct 24', 'Sep 01 — Sep 30', 'Last 90 days'].map((v) => ({ value: v, label: v }))
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function ReportsPage() {
  const { data, loading, error, reload } = useAsync(reportService.get)
  const notify = useToast()
  const navigate = useNavigate()
  const [manage, setManage] = useState(false)
  const [dates, setDates] = useState(DATE_OPTIONS[0]?.value ?? '')
  const [location, setLocation] = useState(ALL)
  const [provider, setProvider] = useState(ALL)
  const [insurance, setInsurance] = useState(ALL)
  const [saved, setSaved] = useSyncedState<SavedReport[]>(data, () => data?.saved ?? [])
  const [modal, setModal] = useState(false)

  const scorecard = useMemo(
    () => (data?.scorecard ?? []).filter((r) => provider === ALL || r.name === provider),
    [data, provider],
  )

  if (loading) return <PageSkeleton />
  if (error || !data) return <ErrorState message={error ?? 'Unable to load reports'} onRetry={reload} />

  const reset = () => {
    setLocation(ALL)
    setProvider(ALL)
    setInsurance(ALL)
  }

  const columns: Column<ProviderScore>[] = [
    {
      key: 'provider',
      header: 'Provider',
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <UserPhoto name={r.name} size={30} />
          <span className="text-[15px] font-semibold text-ink">{r.name}</span>
        </div>
      ),
    },
    { key: 'visits', header: 'Visits', sortValue: (r) => r.visits, render: (r) => <span className="text-[15px] text-ink-2">{r.visits}</span> },
    {
      key: 'rating',
      header: 'Rating',
      sortValue: (r) => r.rating,
      render: (r) => (
        <span className="flex items-center gap-1.5 text-[15px] text-ink-2">
          <Star size={12} className="text-warn" fill="currentColor" />
          {r.rating}
        </span>
      ),
    },
    { key: 'wait', header: 'Wait time', sortValue: (r) => parseInt(r.wait, 10), render: (r) => <span className="text-[15px] text-ink-2">{r.wait}</span> },
    { key: 'completion', header: 'Completion', sortValue: (r) => parseInt(r.completion, 10), render: (r) => <span className="text-[15px] font-medium text-ok">{r.completion}</span> },
  ]

  const providerOptions = [{ value: ALL, label: 'All providers' }, ...data.scorecard.map((s) => ({ value: s.name, label: s.name }))]

  return (
    <div className="space-y-[26px]">
      <PageHeader
        eyebrow={['Intelligence', 'Business analytics']}
        title="Reports & analytics"
        subtitle="Turn clinic data into clearer decisions."
        actions={
          <>
            <Dropdown<string>
              variant="field"
              label="Date range"
              value={dates}
              onChange={setDates}
              options={DATE_OPTIONS}
              leading={<CalendarDays size={16} />}
              className="w-[190px] [&>button]:!h-[44px] [&>button]:!font-semibold [&>button]:!text-ink [&_svg:last-child]:hidden"
              align="right"
            />
            <Button icon={<Download size={16} />} onClick={() => {
              downloadFile('analytics-summary.csv', toCsv(['Metric', 'Value', 'Note'], data.stats.map((m) => [m.label, m.value, m.note ?? ''])))
              notify('Exported analytics-summary.csv')
            }}>
              Export
            </Button>
            <Button variant="primary" icon={<Save size={16} />} onClick={() => setModal(true)}>
              Save report
            </Button>
          </>
        }
      />

      <Card className="flex flex-wrap items-center gap-4 px-[20px] py-[18px]">
        <span className="flex items-center gap-2.5 pr-1 text-[15px] text-muted">
          <Filter size={15} />
          Filters
        </span>
        <Dropdown variant="outline" label="Location" value={location} onChange={setLocation} options={[{ value: ALL, label: 'All locations' }, ...['Northbridge Main', 'Westfield Annex', 'Harborview Satellite'].map((v) => ({ value: v, label: v }))]} className="w-[144px]" />
        <Dropdown variant="outline" label="Provider" value={provider} onChange={setProvider} options={providerOptions} className="w-[147px]" />
        <Dropdown variant="outline" label="Insurance" value={insurance} onChange={setInsurance} options={[{ value: ALL, label: 'All insurance' }, ...['Star Health', 'Aetna', 'Blue Cross', 'Self-pay'].map((v) => ({ value: v, label: v }))]} className="w-[150px]" />
        <button type="button" onClick={reset} className="ml-auto text-[15px] font-semibold text-brand-600 hover:underline">
          Reset filters
        </button>
      </Card>

      <div className="grid-stats-6 gap-[26px]">
        {data.stats.map((s) => (
          <StatCard key={s.id} metric={s} variant="plain" />
        ))}
      </div>

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-[18px] border border-brand-100 bg-linear-to-r from-[#eefbfe] to-[#f6fcfe] px-[25px] py-[22px] shadow-card">
        <div className="flex min-w-0 flex-1 items-start gap-[18px]">
          <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[14px] bg-brand-100 text-brand-600">
            <BrainCircuit size={24} strokeWidth={1.6} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-brand-600">AI Executive Summary</p>
            <h2 className="mt-1.5 text-[21px] font-semibold tracking-[-0.01em] text-ink">{data.summary.headline}</h2>
            <p className="mt-2 text-[15.2px] leading-6 text-muted">{data.summary.body}</p>
          </div>
        </div>
        <Button icon={<Download size={16} />} onClick={() => {
            downloadFile('ai-summary.txt', `${data.summary.headline}\n\n${data.summary.body}\n`, 'text/plain;charset=utf-8')
            notify('Downloaded ai-summary.txt')
          }}>
          Download AI report
        </Button>
      </section>

      <div className="grid gap-[26px] xl:grid-cols-[2.07fr_1fr_1fr]">
        <Card className="flex flex-col p-[25px]">
          <CardHeader
            title="Operational performance"
            subtitle="Visits and wait time by day"
            action={
              <CardLink onClick={() => navigate(ROUTES.schedule)}>
                Explore <ArrowRight size={14} />
              </CardLink>
            }
          />
          <div className="mt-3 flex justify-end gap-5 text-[12.5px] text-faint">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-500" />Patient visits</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-warn" />Wait time</span>
          </div>
          <div className="mt-2 h-[150px]">
            <GradientBars data={data.operations} />
          </div>
          <div className="mt-[26px] flex justify-between text-[12.5px] text-faint" aria-hidden="true">
            {DAY_LABELS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </Card>

        <Card className="p-[25px]">
          <CardHeader title="Appointment mix" subtitle="By visit type" />
          <div className="mt-[18px] flex flex-wrap items-center gap-[18px]">
            <MixDonut data={data.mix} total={data.mixTotal} />
            <ul className="min-w-[140px] flex-1 space-y-[11px] text-[13px]">
              {data.mix.map((m) => (
                <li key={m.name} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-muted">
                    <span className="h-2 w-2 rounded-[2px]" style={{ background: m.color }} />
                    {m.name}
                  </span>
                  <span className="font-semibold text-ink">{m.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-[25px]">
          <CardHeader title="Clinical quality" subtitle="This reporting period" />
          <div className="mt-[26px] space-y-[26px]">
            {data.quality.map((q) => (
              <div key={q.label}>
                <div className="mb-3 flex items-center justify-between text-[13px]">
                  <span className="text-ink-2">{q.label}</span>
                  <span className="font-semibold text-ink">{q.value}%</span>
                </div>
                <ProgressBar value={q.value} label={q.label} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-[26px] xl:grid-cols-[1.42fr_1fr]">
        <Card className="overflow-hidden p-[25px]">
          <CardHeader
            title="Provider scorecard"
            subtitle="Performance overview"
            action={
              <CardLink onClick={() => navigate(ROUTES.providers)}>
                View all providers <ArrowRight size={14} />
              </CardLink>
            }
          />
          <div className="mt-[30px]">
            <DataTable
              columns={columns}
              rows={scorecard}
              rowKey={(r) => r.id}
              minWidth={600}
              emptyTitle="No providers match"
              headerClassName="grid-cols-[316px_121px_157px_157px_1fr] border-b border-line-2 pb-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-faint"
              rowClassName="grid-cols-[316px_121px_157px_157px_1fr] border-b border-line-2 py-[17px] last:border-b-0"
            />
          </div>
        </Card>

        <Card className="p-[25px]">
          <CardHeader
            title="Saved reports"
            subtitle="Your team's most-used views"
            action={
              <CardLink onClick={() => setManage(true)}>
                Manage <ArrowRight size={14} />
              </CardLink>
            }
          />
          <ul className="mt-[34px]">
            {saved.map((r, i) => (
              <li key={`${r.id}-${i}`} className="flex items-center gap-4 border-b border-line-2 py-[15px] first:pt-0 last:border-b-0">
                <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-brand-50 text-brand-600">
                  {r.icon === 'doc' ? <FileText size={18} /> : <BarChart3 size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-bold text-ink">{r.title}</p>
                  <p className="mt-1 truncate text-[13.5px] text-faint">{r.meta}</p>
                </div>
                <button type="button" aria-label={`Run ${r.title}`} onClick={() => {
                  downloadFile(`${r.title.toLowerCase().replace(/\W+/g, '-')}.csv`, toCsv(['Metric', 'Value'], data.stats.map((m) => [m.label, m.value])))
                  notify(`“${r.title}” exported`)
                }} className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border border-line bg-white text-ink-2 shadow-soft hover:bg-tint">
                  <Play size={15} />
                </button>
                <button type="button" aria-label={`Share ${r.title}`} onClick={async () => notify((await copyText(window.location.href)) ? 'Page link copied to clipboard' : 'Could not copy the link')} className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border border-line bg-white text-ink-2 shadow-soft hover:bg-tint">
                  <Share2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <ManageReportsDialog open={manage} reports={saved} onClose={() => setManage(false)} onDelete={(id) => { setSaved((prev) => prev.filter((r) => r.id !== id)); notify('Report removed') }} />
      <SaveReportModal
        open={modal}
        onClose={() => setModal(false)}
        onSave={(title) => {
          setSaved((prev) => [{ id: `r-${Date.now()}`, title, meta: 'Updated just now · Sarah Williams', icon: 'chart' }, ...prev])
          notify(`“${title}” saved`)
          setModal(false)
        }}
      />
    </div>
  )
}

function SaveReportModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (title: string) => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useZodForm(reportNameSchema, { defaultValues: { name: '' } })
  const submit = handleSubmit(async (v) => {
    await new Promise((r) => setTimeout(r, 300))
    onSave(v.name)
    reset()
  })
  return (
    <FormDialog open={open} title="Save report" description="Save the current filters and date range as a reusable view (demo data)." submitLabel="Save report" busy={isSubmitting} onClose={onClose} onSubmit={submit}>
      <TextField label="Report name" placeholder="e.g. Weekly operations review" error={errors.name?.message} {...register('name')} />
    </FormDialog>
  )
}

function ManageReportsDialog({ open, reports, onClose, onDelete }: { open: boolean; reports: SavedReport[]; onClose: () => void; onDelete: (id: string) => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Manage saved reports" description="Remove reports you no longer need." footer={<Button onClick={onClose}>Done</Button>}>
      {reports.length === 0 ? (
        <p className="py-6 text-center text-[14px] text-muted">No saved reports.</p>
      ) : (
        <ul className="space-y-2">
          {reports.map((r, i) => (
            <li key={`${r.id}-${i}`} className="flex items-center justify-between gap-3 rounded-[12px] border border-line-2 px-4 py-3">
              <span className="min-w-0">
                <span className="block truncate text-[14.5px] font-semibold text-ink">{r.title}</span>
                <span className="block truncate text-[12.5px] text-muted">{r.meta}</span>
              </span>
              <Button size="sm" variant="danger" className="!h-[34px] !text-[13px]" onClick={() => onDelete(r.id)} aria-label={`Remove ${r.title}`}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
