import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { CURRENCIES } from '@/constants/settings'
import { useCollection } from '@/hooks/useCollection'
import { useSettingsForm, type FormErrors } from '@/hooks/useSettingsForm'
import { settingsApi } from '@/services/settingsService'
import type { BillingSettings, InsuranceProvider } from '@/types'
import { inRange, isPhone } from '@/utils/validation'
import { SaveBar } from '../components/SaveChangesButton'
import { SectionState } from '../components/SectionState'
import { SettingsCard } from '../components/SettingsCard'
import { FormGrid, NumberField, SelectField, TextAreaField, TextField } from '../components/SettingsFormField'
import { SettingsModal } from '../components/SettingsModal'
import { SettingsTable } from '../components/SettingsTable'
import { SettingsToggle } from '../components/SettingsToggle'
import type { Column } from '@/components/tables/DataTable'

const TERMS = ['Due on receipt', 'Net 15', 'Net 30', 'Net 45']

const validate = (b: BillingSettings): FormErrors => {
  const e: FormErrors = {}
  if (b.taxEnabled) {
    if (!b.taxName.trim()) e.taxName = 'Tax name is required'
    if (!inRange(b.taxRate, 0, 100)) e.taxRate = 'Rate must be between 0 and 100'
  }
  if (!b.paymentMethods.some((m) => m.enabled)) e.paymentMethods = 'Enable at least one payment method'
  if (!inRange(b.verifyHoursBefore, 1, 336)) e.verifyHoursBefore = 'Between 1 and 336 hours'
  if (!/^[A-Za-z0-9-_]{0,10}$/.test(b.invoicePrefix)) e.invoicePrefix = 'Up to 10 letters, numbers, - or _'
  if (!inRange(b.nextInvoiceNumber, 1, 99999999)) e.nextInvoiceNumber = 'Enter a positive whole number'
  if (b.refundPolicy.trim().length < 10) e.refundPolicy = 'Describe your refund policy (at least 10 characters)'
  return e
}

interface InsuranceDraft {
  name: string
  payerId: string
  phone: string
  plans: string
  accepted: boolean
}
const emptyInsurance: InsuranceDraft = { name: '', payerId: '', phone: '', plans: '', accepted: true }

export default function BillingInsurance() {
  const form = useSettingsForm(settingsApi.billing, validate)
  const insurance = useCollection(settingsApi.insurance)
  const { draft, patch, errors } = form

  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<InsuranceProvider | null>(null)
  const [adding, setAdding] = useState(false)
  const [toRemove, setToRemove] = useState<InsuranceProvider | null>(null)

  const rows = useMemo(() => insurance.items.filter((i) => `${i.name} ${i.payerId}`.toLowerCase().includes(query.trim().toLowerCase())), [insurance.items, query])

  const columns: Column<InsuranceProvider>[] = [
    { key: 'name', header: 'Provider', sortValue: (r) => r.name, render: (r) => <span className="text-[15px] font-semibold text-ink">{r.name}</span> },
    { key: 'payer', header: 'Payer ID', sortValue: (r) => r.payerId, render: (r) => <span className="text-[14.5px] text-muted">{r.payerId}</span> },
    { key: 'plans', header: 'Plans', render: (r) => <span className="text-[14.5px] text-muted">{r.plans || '—'}</span> },
    { key: 'status', header: 'Status', sortValue: (r) => String(r.accepted), render: (r) => <Badge tone={r.accepted ? 'ok' : 'neutral'} dot size="sm">{r.accepted ? 'Accepted' : 'Not accepted'}</Badge> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex gap-1.5">
          <button type="button" aria-label={`Edit ${r.name}`} onClick={() => setEditing(r)} className="rounded-[8px] border border-line p-2 text-ink-2 hover:bg-tint"><Pencil size={14} /></button>
          <button type="button" aria-label={`Remove ${r.name}`} onClick={() => setToRemove(r)} className="rounded-[8px] border border-line p-2 text-bad hover:bg-[#fff1f1]"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <SectionState loading={form.loading || insurance.loading} error={form.loadError ?? insurance.error} onRetry={form.reload}>
      {draft && (
        <div className="space-y-5">
          <SettingsCard title="Billing & insurance" subtitle="Currency, taxes, payment methods and accepted insurance">
            <div className="mt-6 space-y-6">
              <FormGrid>
                <SelectField label="Currency" options={CURRENCIES} value={draft.currency} onChange={(v) => patch({ currency: v })} />
                <SelectField label="Payment terms" options={TERMS} value={draft.paymentTerms} onChange={(v) => patch({ paymentTerms: v })} />
              </FormGrid>
              <SettingsToggle title="Charge tax" description="Apply tax to invoices for taxable services" checked={draft.taxEnabled} onChange={(v) => patch({ taxEnabled: v })} />
              {draft.taxEnabled && (
                <FormGrid>
                  <TextField label="Tax name" value={draft.taxName} onChange={(e) => patch({ taxName: e.target.value })} error={errors.taxName} />
                  <NumberField label="Tax rate" suffix="%" step={0.01} value={draft.taxRate} onChange={(v) => patch({ taxRate: v })} error={errors.taxRate} />
                </FormGrid>
              )}
            </div>
          </SettingsCard>

          <SettingsCard title="Payment methods" subtitle="Accepted ways to pay">
            <div className="mt-6 grid gap-x-12 gap-y-6 md:grid-cols-2">
              {draft.paymentMethods.map((m) => (
                <SettingsToggle key={m.id} title={m.label} checked={m.enabled} onChange={(v) => patch({ paymentMethods: draft.paymentMethods.map((p) => (p.id === m.id ? { ...p, enabled: v } : p)) })} />
              ))}
            </div>
            {errors.paymentMethods && <p role="alert" className="mt-4 text-[13px] text-bad">{errors.paymentMethods}</p>}
          </SettingsCard>

          <SettingsCard title="Invoices & preferences" subtitle="How invoices are numbered and sent">
            <div className="mt-6 space-y-6">
              <FormGrid cols={3}>
                <TextField label="Invoice prefix" value={draft.invoicePrefix} onChange={(e) => patch({ invoicePrefix: e.target.value })} error={errors.invoicePrefix} />
                <NumberField label="Next invoice number" value={draft.nextInvoiceNumber} onChange={(v) => patch({ nextInvoiceNumber: Math.floor(v) })} error={errors.nextInvoiceNumber} />
                <TextField label="Preview" value={`${draft.invoicePrefix}${draft.nextInvoiceNumber}`} readOnly aria-readonly />
              </FormGrid>
              <TextAreaField label="Invoice footer" value={draft.invoiceFooter} onChange={(e) => patch({ invoiceFooter: e.target.value })} />
              <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                <SettingsToggle title="Create invoices automatically" description="Generate an invoice when a visit is completed" checked={draft.autoInvoice} onChange={(v) => patch({ autoInvoice: v })} />
                <SettingsToggle title="Email receipts" description="Send a receipt after each payment" checked={draft.sendReceipts} onChange={(v) => patch({ sendReceipts: v })} />
                <SettingsToggle title="Collect copay at check-in" checked={draft.collectCopayAtCheckIn} onChange={(v) => patch({ collectCopayAtCheckIn: v })} />
              </div>
              <TextAreaField label="Refund policy" value={draft.refundPolicy} onChange={(e) => patch({ refundPolicy: e.target.value })} error={errors.refundPolicy} />
            </div>
          </SettingsCard>

          <SettingsCard title="Insurance verification & billing alerts" subtitle="Automate eligibility checks and keep finance informed">
            <div className="mt-6 space-y-6">
              <SettingsToggle title="Verify insurance automatically" description="Check eligibility before each insured visit" checked={draft.autoVerifyInsurance} onChange={(v) => patch({ autoVerifyInsurance: v })} />
              {draft.autoVerifyInsurance && (
                <div className="max-w-[300px]">
                  <NumberField label="Verify" suffix="hrs" value={draft.verifyHoursBefore} onChange={(v) => patch({ verifyHoursBefore: v })} error={errors.verifyHoursBefore} hint="Hours before the visit" />
                </div>
              )}
              <div className="grid gap-x-12 gap-y-6 border-t border-line-2 pt-6 md:grid-cols-2">
                <SettingsToggle title="Invoice sent" checked={draft.notifyInvoiceSent} onChange={(v) => patch({ notifyInvoiceSent: v })} />
                <SettingsToggle title="Payment received" checked={draft.notifyPaymentReceived} onChange={(v) => patch({ notifyPaymentReceived: v })} />
                <SettingsToggle title="Invoice overdue" checked={draft.notifyOverdue} onChange={(v) => patch({ notifyOverdue: v })} />
              </div>
            </div>
          </SettingsCard>

          <SaveBar dirty={form.dirty} saving={form.saving} onSave={form.save} onCancel={form.reset} />

          <SettingsTable
            title="Insurance providers"
            subtitle="Payers your clinic works with. Changes here apply immediately."
            action={<Button variant="primary" icon={<Plus size={16} />} onClick={() => setAdding(true)}>Add provider</Button>}
            toolbar={
              <label className="flex h-[44px] w-full max-w-[340px] items-center gap-3 rounded-[12px] border border-line bg-white px-4">
                <Search size={15} className="text-ink-2" />
                <span className="sr-only">Search insurance providers</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search insurance providers" className="h-full flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-muted" />
              </label>
            }
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            template="grid-cols-[1.4fr_1fr_1.2fr_1fr_90px]"
            minWidth={720}
            emptyTitle="No insurance providers"
            emptyDescription="Add a provider or adjust your search."
          />

          <InsuranceModal
            key={editing?.id ?? (adding ? 'new' : 'closed')}
            open={adding || editing !== null}
            initial={editing}
            onClose={() => { setAdding(false); setEditing(null) }}
            onSubmit={async (v) => {
              if (editing) await insurance.update({ ...editing, ...v }, `${v.name} updated`)
              else await insurance.create(v, `${v.name} added`)
              setAdding(false)
              setEditing(null)
            }}
          />
          <ConfirmDialog
            open={toRemove !== null}
            danger
            title="Remove insurance provider?"
            message={`${toRemove?.name ?? 'This provider'} will no longer be listed as accepted. Existing invoices are not affected.`}
            confirmLabel="Remove"
            onCancel={() => setToRemove(null)}
            onConfirm={async () => {
              if (toRemove) await insurance.remove(toRemove.id, `${toRemove.name} removed`)
              setToRemove(null)
            }}
          />
        </div>
      )}
    </SectionState>
  )
}

function InsuranceModal({ open, initial, onClose, onSubmit }: { open: boolean; initial: InsuranceProvider | null; onClose: () => void; onSubmit: (v: InsuranceDraft) => Promise<void> }) {
  const [v, setV] = useState<InsuranceDraft>(initial ? { name: initial.name, payerId: initial.payerId, phone: initial.phone, plans: initial.plans, accepted: initial.accepted } : emptyInsurance)
  const [errors, setErrors] = useState<FormErrors>({})
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const e: FormErrors = {}
    if (v.name.trim().length < 2) e.name = 'Provider name is required'
    if (!v.payerId.trim()) e.payerId = 'Payer ID is required'
    if (v.phone.trim() && !isPhone(v.phone)) e.phone = 'Enter a valid phone number'
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    await onSubmit({ ...v, name: v.name.trim(), payerId: v.payerId.trim() })
    setBusy(false)
  }

  return (
    <SettingsModal open={open} title={initial ? 'Edit insurance provider' : 'Add insurance provider'} submitLabel={initial ? 'Save changes' : 'Add provider'} busy={busy} onClose={onClose} onSubmit={submit}>
      <TextField label="Provider name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={errors.name} />
      <FormGrid>
        <TextField label="Payer ID" value={v.payerId} onChange={(e) => setV({ ...v, payerId: e.target.value })} error={errors.payerId} />
        <TextField label="Phone" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} error={errors.phone} />
      </FormGrid>
      <TextField label="Plans" value={v.plans} onChange={(e) => setV({ ...v, plans: e.target.value })} placeholder="e.g. PPO, HMO" />
      <SettingsToggle title="Accepted at this clinic" checked={v.accepted} onChange={(a) => setV({ ...v, accepted: a })} />
    </SettingsModal>
  )
}
