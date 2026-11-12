import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Toggle } from '@/components/common/Toggle'
import type { Column } from '@/components/tables/DataTable'
import { useCollection } from '@/hooks/useCollection'
import type { FormErrors } from '@/hooks/useSettingsForm'
import { providerNames, serviceCategories } from '@/mocks/settings.mock'
import { settingsApi } from '@/services/settingsService'
import type { ClinicServiceItem, ConsultationType, SettingsLocation } from '@/types'
import { formatCurrency } from '@/utils/format'
import { inRange } from '@/utils/validation'
import { SectionState } from '../components/SectionState'
import { SettingsHeader } from '../components/SettingsHeader'
import { ChipSelect, FormGrid, NumberField, SelectField, TextAreaField, TextField } from '../components/SettingsFormField'
import { SettingsModal } from '../components/SettingsModal'
import { SettingsTable } from '../components/SettingsTable'
import { SettingsToggle } from '../components/SettingsToggle'

const TYPES: ConsultationType[] = ['In-person', 'Virtual', 'In-person & virtual']
type ServiceDraft = Omit<ClinicServiceItem, 'id'>

const blank = (): ServiceDraft => ({
  name: '', category: serviceCategories[0] ?? '', description: '', durationMin: 30, consultationType: 'In-person',
  price: 0, providers: [], locationIds: [], active: true,
})

export default function Services() {
  const services = useCollection(settingsApi.services)
  const locations = useCollection(settingsApi.locations)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<ClinicServiceItem | null>(null)
  const [toDelete, setToDelete] = useState<ClinicServiceItem | null>(null)

  const items = services.items
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((s) => {
      if (category !== 'all' && s.category !== category) return false
      if (status === 'active' && !s.active) return false
      if (status === 'inactive' && s.active) return false
      return !q || [s.name, s.description].some((v) => v.toLowerCase().includes(q))
    })
  }, [items, query, category, status])

  const columns: Column<ClinicServiceItem>[] = [
    {
      key: 'name',
      header: 'Service',
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-ink">{r.name}</p>
          <p className="truncate text-[12.5px] text-muted">{r.description || 'No description'}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', sortValue: (r) => r.category, render: (r) => <span className="text-[14px] text-muted">{r.category}</span> },
    { key: 'type', header: 'Type', sortValue: (r) => r.consultationType, render: (r) => <Badge tone={r.consultationType === 'In-person' ? 'ok' : r.consultationType === 'Virtual' ? 'violet' : 'info'} size="sm">{r.consultationType}</Badge> },
    { key: 'duration', header: 'Duration', sortValue: (r) => r.durationMin, render: (r) => <span className="text-[14px] text-muted">{r.durationMin} min</span> },
    { key: 'price', header: 'Price', sortValue: (r) => r.price, render: (r) => <span className="text-[14.5px] font-semibold text-ink">{formatCurrency(r.price)}</span> },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => String(r.active),
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Toggle checked={r.active} onChange={(v) => services.update({ ...r, active: v }, `${r.name} ${v ? 'activated' : 'deactivated'}`)} label={`${r.name} active`} size="sm" />
          <span className="text-[13px] text-muted">{r.active ? 'Active' : 'Inactive'}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex gap-1.5">
          <button type="button" aria-label={`Edit ${r.name}`} onClick={() => setEditing(r)} className="rounded-[8px] border border-line p-2 text-ink-2 hover:bg-tint"><Pencil size={14} /></button>
          <button type="button" aria-label={`Delete ${r.name}`} onClick={() => setToDelete(r)} className="rounded-[8px] border border-line p-2 text-bad hover:bg-[#fff1f1]"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <SectionState loading={services.loading || locations.loading} error={services.error ?? locations.error} onRetry={services.reload}>
      <div className="space-y-5">
        <SettingsHeader
          title="Services"
          description="The services your clinic offers, with pricing and availability"
          actions={<Button variant="primary" icon={<Plus size={16} />} onClick={() => setAdding(true)}>Add service</Button>}
          stats={[
            { label: 'Total services', value: items.length },
            { label: 'Active services', value: items.filter((s) => s.active).length, tone: 'ok' },
            { label: 'Inactive services', value: items.filter((s) => !s.active).length, tone: 'warn' },
            { label: 'Virtual-enabled', value: items.filter((s) => s.consultationType !== 'In-person').length },
          ]}
        />

        <SettingsTable
          toolbar={
            <>
              <label className="flex h-[48px] min-w-[220px] flex-1 items-center gap-3 rounded-[12px] border border-line bg-white px-4 sm:max-w-[340px]">
                <Search size={15} className="text-ink-2" />
                <span className="sr-only">Search services</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services" className="h-full flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-muted" />
              </label>
              <div className="w-[200px]">
                <SelectField label="" aria-label="Filter by category" options={[{ value: 'all', label: 'All categories' }, ...serviceCategories.map((c) => ({ value: c, label: c }))]} value={category} onChange={setCategory} wrapperClassName="[&>label]:hidden" />
              </div>
              <div className="w-[170px]">
                <SelectField label="" aria-label="Filter by status" options={[{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} value={status} onChange={setStatus} wrapperClassName="[&>label]:hidden" />
              </div>
            </>
          }
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          template="grid-cols-[2fr_1.1fr_1.2fr_.8fr_.8fr_1.2fr_90px]"
          minWidth={1060}
          emptyTitle="No services found"
          emptyDescription="Add a service or clear your search and filters."
        />

        <ServiceModal
          key={editing?.id ?? (adding ? 'new' : 'closed')}
          open={adding || editing !== null}
          initial={editing}
          locations={locations.items}
          onClose={() => { setAdding(false); setEditing(null) }}
          onSubmit={async (v) => {
            if (editing) await services.update({ ...editing, ...v }, `${v.name} updated`)
            else await services.create(v, `${v.name} added`)
            setAdding(false)
            setEditing(null)
          }}
        />
        <ConfirmDialog
          open={toDelete !== null}
          danger
          title="Delete service?"
          message={`“${toDelete?.name ?? ''}” will no longer be offered. Existing appointments are not affected. This cannot be undone.`}
          confirmLabel="Delete service"
          onCancel={() => setToDelete(null)}
          onConfirm={async () => {
            if (toDelete) await services.remove(toDelete.id, `${toDelete.name} deleted`)
            setToDelete(null)
          }}
        />
      </div>
    </SectionState>
  )
}

function ServiceModal({ open, initial, locations, onClose, onSubmit }: { open: boolean; initial: ClinicServiceItem | null; locations: SettingsLocation[]; onClose: () => void; onSubmit: (v: ServiceDraft) => Promise<void> }) {
  const [v, setV] = useState<ServiceDraft>(() => {
    if (!initial) return blank()
    const { id: _id, ...rest } = initial
    return structuredClone(rest)
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof ServiceDraft>(k: K, val: ServiceDraft[K]) => setV((p) => ({ ...p, [k]: val }))

  const submit = async () => {
    const e: FormErrors = {}
    if (v.name.trim().length < 2) e.name = 'Service name is required'
    if (!inRange(v.durationMin, 5, 480)) e.durationMin = 'Between 5 and 480 minutes'
    if (!inRange(v.price, 0, 100000)) e.price = 'Enter a price of 0 or more'
    if (v.providers.length === 0) e.providers = 'Assign at least one provider'
    if (v.locationIds.length === 0) e.locationIds = 'Select at least one location'
    if (v.description.length > 300) e.description = 'Keep the description under 300 characters'
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    await onSubmit({ ...v, name: v.name.trim() })
    setBusy(false)
  }

  return (
    <SettingsModal open={open} size="lg" title={initial ? 'Edit service' : 'Add service'} description="Describe the service and where it is available." submitLabel={initial ? 'Save changes' : 'Add service'} busy={busy} onClose={onClose} onSubmit={submit}>
      <FormGrid>
        <TextField label="Service name" value={v.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
        <SelectField label="Service category" options={serviceCategories} value={v.category} onChange={(c) => set('category', c)} />
        <SelectField label="Consultation type" options={TYPES} value={v.consultationType} onChange={(t) => set('consultationType', t as ConsultationType)} />
        <NumberField label="Duration" suffix="min" value={v.durationMin} onChange={(n) => set('durationMin', n)} error={errors.durationMin} />
        <NumberField label="Price (USD)" step={0.01} value={v.price} onChange={(n) => set('price', n)} error={errors.price} />
      </FormGrid>
      <TextAreaField label="Description" value={v.description} onChange={(e) => set('description', e.target.value)} error={errors.description} />
      <ChipSelect label="Associated providers" options={providerNames.map((p) => ({ value: p, label: p }))} selected={v.providers} onChange={(p) => set('providers', p)} error={errors.providers} />
      <ChipSelect label="Available locations" options={locations.map((l) => ({ value: l.id, label: l.name }))} selected={v.locationIds} onChange={(l) => set('locationIds', l)} error={errors.locationIds} />
      <SettingsToggle title="Active" description="Inactive services are hidden from booking" checked={v.active} onChange={(a) => set('active', a)} />
    </SettingsModal>
  )
}
