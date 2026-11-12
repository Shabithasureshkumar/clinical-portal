import { useSyncedState } from '@/hooks/useSyncedState'
import { UserPhoto } from '@/components/common/UserPhoto'
import { ArrowRight, CalendarDays, Download, Filter, MoreHorizontal, Plus, Search, TrendingUp } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatCard } from '@/components/cards/StatCard'
import { RevenueAreaChart } from '@/components/charts/Charts'
import { Button } from '@/components/common/Button'
import { Card, CardLink } from '@/components/common/Card'
import { Dropdown } from '@/components/common/Dropdown'
import { PageHeader } from '@/components/common/PageHeader'
import { Pagination } from '@/components/common/Pagination'
import { SegmentedControl } from '@/components/common/SegmentedControl'
import { ErrorState, PageSkeleton } from '@/components/common/States'
import { useToast } from '@/components/common/Toast'
import { TextField } from '@/components/forms/Fields'
import { FormDialog } from '@/components/forms/FormDialog'
import { ROUTES } from '@/constants/routes'
import { useZodForm } from '@/hooks/useZodForm'
import { invoiceSchema } from '@/schemas/common'
import { downloadFile, toCsv } from '@/utils/download'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useAsync } from '@/hooks/useAsync'
import { billingService } from '@/services/billingService'
import type { BillingTab, Invoice, InvoiceStatus, RevenueRange } from '@/types'
import { cn } from '@/utils/cn'
import { formatCurrency, formatCurrency0 } from '@/utils/format'

const PAGE_SIZE = 4
const RANGES: readonly RevenueRange[] = ['Daily', 'Weekly', 'Monthly']
const TABS: BillingTab[] = ['Invoices', 'Claims', 'Payments', 'All transactions']
const DATE_OPTIONS = [
  { value: 'Oct 01 — Oct 24', label: 'Oct 01 — Oct 24' },
  { value: 'Sep 01 — Sep 30', label: 'Sep 01 — Sep 30' },
  { value: 'Last 90 days', label: 'Last 90 days' },
]

const STATUS_STYLE: Record<InvoiceStatus, { bg: string; fg: string }> = {
  Paid: { bg: '#dff7e8', fg: '#0c7a54' },
  'Insurance pending': { bg: '#ffefd6', fg: '#965f00' },
  Sent: { bg: '#e0f1fe', fg: '#216eab' },
  Overdue: { bg: '#ffe0e0', fg: '#b53838' },
}

function RowMenu({ invoice, onPaid, onNotify }: { invoice: Invoice; onPaid: (id: string) => void; onNotify: (m: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false), open)
  const item = 'block w-full rounded-[8px] px-3 py-2 text-left text-[13.5px] text-ink-2 hover:bg-tint'
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Actions for ${invoice.id}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-line bg-white text-ink-2 hover:bg-tint"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-2 w-[176px] rounded-[12px] border border-line bg-white p-1.5 shadow-[0_12px_32px_rgba(15,40,60,0.14)]">
          <button role="menuitem" type="button" className={item} onClick={() => { onNotify(`Opening ${invoice.id}`); setOpen(false) }}>
            View invoice
          </button>
          <button role="menuitem" type="button" className={item} onClick={() => { onNotify(`${invoice.id} downloaded`); setOpen(false) }}>
            Download PDF
          </button>
          {invoice.status !== 'Paid' && (
            <button role="menuitem" type="button" className={item} onClick={() => { onPaid(invoice.id); setOpen(false) }}>
              Mark as paid
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function BillingPage() {
  const { data, loading, error, reload } = useAsync(billingService.get)
  const notify = useToast()
  const navigate = useNavigate()
  const [range, setRange] = useState<RevenueRange>('Daily')
  const [dates, setDates] = useState(DATE_OPTIONS[0]?.value ?? '')
  const [tab, setTab] = useState<BillingTab>('Invoices')
  const [query, setQuery] = useState('')
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [page, setPage] = useSyncedState(`${tab}|${query}|${onlyOpen}`, () => 1)
  const [invoices, setInvoices] = useSyncedState(data, () => data?.invoices ?? [])
  const [modal, setModal] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return invoices.filter((i) => {
      if (tab === 'Claims' && i.status !== 'Insurance pending' && i.status !== 'Overdue') return false
      if (tab === 'Payments' && i.status !== 'Paid') return false
      if (onlyOpen && i.status === 'Paid') return false
      return !q || [i.id, i.patient, i.provider, i.service].some((v) => v.toLowerCase().includes(q))
    })
  }, [invoices, tab, query, onlyOpen])

  if (loading) return <PageSkeleton />
  if (error || !data) return <ErrorState message={error ?? 'Unable to load billing'} onRetry={reload} />

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const maxRevenue = Math.max(...data.providers.map((p) => p.revenue))

  const markPaid = (id: string) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'Paid' } : i)))
    notify(`${id} marked as paid`)
  }

  const columns: Column<Invoice>[] = [
    { key: 'id', header: 'Invoice number', sortValue: (r) => r.id, render: (r) => <span className="text-[14.5px] font-semibold text-brand-600">{r.id}</span> },
    { key: 'patient', header: 'Patient', sortValue: (r) => r.patient, render: (r) => <span className="text-[14.5px] text-ink-2">{r.patient}</span> },
    { key: 'provider', header: 'Provider', sortValue: (r) => r.provider, render: (r) => <span className="text-[14.5px] text-ink-2">{r.provider}</span> },
    { key: 'service', header: 'Service', sortValue: (r) => r.service, render: (r) => <span className="text-[14.5px] text-ink-2">{r.service}</span> },
    { key: 'balance', header: 'Balance', sortValue: (r) => r.balance, render: (r) => <span className="text-[14.5px] font-semibold text-ink">{formatCurrency(r.balance)}</span> },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.status,
      render: (r) => (
        <div className="flex items-center gap-3 pr-[26px]">
          <span
            className="block min-w-0 flex-1 rounded-[10px] px-3.5 py-[9px] text-[14px] font-semibold"
            style={{ background: STATUS_STYLE[r.status].bg, color: STATUS_STYLE[r.status].fg }}
          >
            {r.status}
          </span>
          <RowMenu invoice={r} onPaid={markPaid} onNotify={notify} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-[26px]">
      <PageHeader
        eyebrow={['Finance', 'Revenue cycle']}
        title="Billing & revenue"
        subtitle="Track financial health and keep your revenue cycle moving."
        actions={
          <>
            <Dropdown<string>
              variant="field"
              label="Date range"
              value={dates}
              onChange={setDates}
              options={DATE_OPTIONS}
              leading={<CalendarDays size={16} />}
              className="w-[210px] [&>button]:!h-[44px] [&>button]:!font-semibold [&>button]:!text-ink"
              align="right"
            />
            <Button icon={<Download size={16} />} onClick={() => {
              downloadFile('invoices.csv', toCsv(['Invoice', 'Patient', 'Provider', 'Service', 'Balance', 'Status'], invoices.map((i) => [i.id, i.patient, i.provider, i.service, i.balance, i.status])))
              notify('Invoices exported as invoices.csv')
            }}>
              Export report
            </Button>
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => setModal(true)}>
              Create invoice
            </Button>
          </>
        }
      />

      <div className="grid-stats-6 gap-[26px]">
        {data.stats.map((s) => (
          <StatCard key={s.id} metric={s} variant="icon" />
        ))}
      </div>

      <div className="grid gap-[26px] xl:grid-cols-[2.05fr_1fr]">
        <Card className="p-[25px]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[20.5px] font-semibold tracking-[-0.01em] text-ink">Revenue analytics</h2>
              <p className="mt-2.5 text-[14.5px] text-faint">Track your financial performance over time</p>
            </div>
            <CardLink onClick={() => navigate(ROUTES.reports)}>
              Full report <ArrowRight size={14} />
            </CardLink>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[30px] font-bold tracking-[-0.025em] text-ink">{data.total}</p>
              <p className="mt-2 flex items-center gap-1.5 text-[14.5px] font-medium text-ok">
                <TrendingUp size={14} /> {data.delta}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <span className="flex items-center gap-4 text-[14px] text-faint">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-500" />Gross revenue</span>
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#5b7cf0]" />Net revenue</span>
              </span>
              <SegmentedControl label="Revenue range" options={RANGES} value={range} onChange={setRange} />
            </div>
          </div>
          <div className="mt-2 h-[250px]">
            <RevenueAreaChart data={data.series[range]} />
          </div>
        </Card>

        <Card className="flex max-h-[475px] flex-col overflow-hidden p-[25px] pb-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[20.5px] font-semibold tracking-[-0.01em] text-ink">Revenue by provider</h2>
              <p className="mt-2.5 text-[14.5px] text-faint">October 2024</p>
            </div>
            <CardLink onClick={() => navigate(ROUTES.providers)}>
              View all <ArrowRight size={14} />
            </CardLink>
          </div>
          <div role="region" tabIndex={0} aria-label="Top providers" className="scrollbar-thin mt-6 flex-1 overflow-y-auto pb-6">
          <ul className="space-y-[22px]">
            {data.providers.map((p) => (
              <li key={p.id} className="flex items-center gap-4">
                <UserPhoto name={p.name} size={36} />
                <div className="w-[140px] shrink-0">
                  <p className="text-[15.5px] font-bold text-ink">{p.name}</p>
                  <p className="mt-1 text-[13.5px] text-faint">{p.visits} visits</p>
                </div>
                <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#edf2f5]">
                  <div className="h-full rounded-full bg-linear-to-r from-[#12c2e6] to-[#6edbef]" style={{ width: `${(p.revenue / maxRevenue) * 84}%` }} />
                </div>
                <span className="w-[76px] text-right text-[15.5px] font-bold text-ink">{formatCurrency0(p.revenue)}</span>
              </li>
            ))}
          </ul>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 p-[25px] pb-5">
          <div>
            <h2 className="text-[20.5px] font-semibold tracking-[-0.01em] text-ink">Financial activity</h2>
            <p className="mt-2.5 text-[14.5px] text-faint">Invoices, claims, and payments</p>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <label className="flex h-[42px] min-w-0 flex-1 items-center gap-3 rounded-[10px] border border-line-2 bg-page px-4 sm:w-[228px] sm:flex-none">
              <Search size={15} className="text-faint" />
              <span className="sr-only">Search transactions</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search transactions" className="h-full flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-faint" />
            </label>
            <Button aria-pressed={onlyOpen} className={cn('!h-[42px] !text-[14.5px]', onlyOpen && '!border-brand-300 !bg-brand-50 !text-brand-700')} icon={<Filter size={15} />} onClick={() => setOnlyOpen((v) => !v)}>
              Filter
            </Button>
          </div>
        </div>

        <div role="tablist" aria-label="Financial activity" className="scrollbar-thin flex gap-9 overflow-x-auto border-b border-line px-[25px]">
          {TABS.map((t) => {
            const count = t === 'All transactions' ? undefined : data.tabCounts[t]
            const active = tab === t
            return (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setTab(t)}
                className={cn(
                  '-mb-px flex shrink-0 items-center gap-2 border-b-2 pb-[14px] pt-1 text-[16px] transition',
                  active ? 'border-brand-500 font-semibold text-brand-600' : 'border-transparent text-faint hover:text-ink-2',
                )}
              >
                {t}
                {count !== undefined && <span className="rounded-[7px] bg-[#edf2f5] px-2 py-0.5 text-[12.5px] font-semibold text-muted">{count}</span>}
              </button>
            )
          })}
        </div>

        <div className="px-0">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            minWidth={880}
            emptyTitle="No transactions found"
            headerClassName="grid-cols-[1.05fr_1.05fr_1.05fr_1.15fr_.95fr_1.9fr] bg-page/70 px-[25px] py-[17px] text-[13px] font-semibold uppercase tracking-[0.08em] text-faint"
            rowClassName="grid-cols-[1.05fr_1.05fr_1.05fr_1.15fr_.95fr_1.9fr] border-t border-line-2 px-[25px] py-[17px]"
          />
        </div>
        <Pagination page={page} pageCount={pageCount} onChange={setPage} className="p-[20px] pt-4" />
      </Card>

      <CreateInvoiceModal
        open={modal}
        onClose={() => setModal(false)}
        onCreate={(inv) => {
          setInvoices((prev) => [inv, ...prev])
          setTab('Invoices')
          notify(`${inv.id} created`)
          setModal(false)
        }}
        nextId={`INV-${20483 + invoices.length - data.invoices.length}`}
      />
    </div>
  )
}

function CreateInvoiceModal({ open, onClose, onCreate, nextId }: { open: boolean; onClose: () => void; onCreate: (i: Invoice) => void; nextId: string }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useZodForm(invoiceSchema, { defaultValues: { patient: '', service: '', amount: '' } })

  const submit = handleSubmit(async (v) => {
    await new Promise((r) => setTimeout(r, 400))
    onCreate({ id: nextId, patient: v.patient, provider: 'Dr. Williams', service: v.service, balance: v.amount, status: 'Sent' })
    reset()
  })

  return (
    <FormDialog open={open} title="Create invoice" description={`New invoice ${nextId} (demo data, not saved to a server)`} submitLabel="Create invoice" busy={isSubmitting} onClose={onClose} onSubmit={submit}>
      <TextField label="Patient" placeholder="Patient name" error={errors.patient?.message} {...register('patient')} />
      <TextField label="Service" placeholder="e.g. Wellness visit" error={errors.service?.message} {...register('service')} />
      <TextField label="Amount (USD)" inputMode="decimal" placeholder="0.00" error={errors.amount?.message} {...register('amount')} />
    </FormDialog>
  )
}
