import { Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/Toast'
import { Toggle } from '@/components/common/Toggle'
import type { Column } from '@/components/tables/DataTable'
import { TIMEZONES } from '@/constants/settings'
import { useCollection } from '@/hooks/useCollection'
import type { FormErrors } from '@/hooks/useSettingsForm'
import { settingsApi } from '@/services/settingsService'
import type { LocationType, OperatingHours, SettingsLocation } from '@/types'
import { isEmail, isPhone, isZip } from '@/utils/validation'
import { SectionState } from '../components/SectionState'
import { SettingsHeader } from '../components/SettingsHeader'
import { FormGrid, SelectField, TextField } from '../components/SettingsFormField'
import { SettingsModal } from '../components/SettingsModal'
import { SettingsTable } from '../components/SettingsTable'
import { SettingsToggle } from '../components/SettingsToggle'

const TYPES: LocationType[] = ['Main clinic', 'Satellite clinic', 'Urgent care', 'Telehealth hub']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type LocationDraft = Omit<SettingsLocation, 'id'>

const blank = (): LocationDraft => ({
  name: '', type: 'Satellite clinic', address1: '', address2: '', city: '', state: '', zip: '', country: 'United States',
  phone: '', email: '', timezone: 'America/Los_Angeles', primary: false, active: true,
  hours: DAYS.map((day, i) => ({ day, closed: i >= 5, open: '08:00', close: '17:00' })),
})

const hoursSummary = (hours: OperatingHours[]): string => {
  const open = hours.filter((h) => !h.closed)
  if (open.length === 0) return 'Closed'
  const first = open[0]
  const same = open.every((h) => h.open === first?.open && h.close === first?.close)
  return same && first ? `${open.length} days · ${first.open}–${first.close}` : `${open.length} days (varies)`
}

export default function Locations() {
  const locations = useCollection(settingsApi.locations)
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<SettingsLocation | null>(null)
  const [toDelete, setToDelete] = useState<SettingsLocation | null>(null)

  const items = locations.items
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((l) => {
      if (status === 'active' && !l.active) return false
      if (status === 'inactive' && l.active) return false
      return !q || [l.name, l.city, l.address1, l.state].some((v) => v.toLowerCase().includes(q))
    })
  }, [items, query, status])

  const primary = items.find((l) => l.primary)

  /** Only one location may be primary; promote the saved one and demote the rest. */
  const savePrimary = async (saved: SettingsLocation) => {
    if (!saved.primary) return
    const others = items.filter((l) => l.id !== saved.id && l.primary)
    for (const o of others) await locations.update({ ...o, primary: false }, `${o.name} is no longer primary`)
  }

  const toggleActive = async (l: SettingsLocation, active: boolean) => {
    if (l.primary && !active) return notify('The primary location cannot be deactivated. Make another location primary first.')
    await locations.update({ ...l, active }, `${l.name} ${active ? 'activated' : 'deactivated'}`)
  }

  const columns: Column<SettingsLocation>[] = [
    {
      key: 'name',
      header: 'Location',
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <span className="truncate">{r.name}</span>
            {r.primary && <Badge tone="brand" size="sm"><Star size={10} fill="currentColor" />Primary</Badge>}
          </p>
          <p className="text-[12.5px] text-muted">{r.type}</p>
        </div>
      ),
    },
    { key: 'address', header: 'Address', render: (r) => <span className="text-[14px] text-muted">{[r.address1, r.city, r.state].filter(Boolean).join(', ')}</span> },
    { key: 'phone', header: 'Phone', render: (r) => <span className="text-[14px] text-muted">{r.phone}</span> },
    { key: 'hours', header: 'Hours', render: (r) => <span className="text-[14px] text-muted">{hoursSummary(r.hours)}</span> },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => String(r.active),
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Toggle checked={r.active} onChange={(v) => toggleActive(r, v)} label={`${r.name} active`} size="sm" />
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
    <SectionState loading={locations.loading} error={locations.error} onRetry={locations.reload}>
      <div className="space-y-5">
        <SettingsHeader
          title="Locations"
          description="Manage every clinic location, address and operating hours"
          actions={<Button variant="primary" icon={<Plus size={16} />} onClick={() => setAdding(true)}>Add location</Button>}
          stats={[
            { label: 'Total locations', value: items.length },
            { label: 'Active locations', value: items.filter((l) => l.active).length, tone: 'ok' },
            { label: 'Inactive', value: items.filter((l) => !l.active).length, tone: 'warn' },
            { label: 'Primary location', value: primary?.name ?? 'Not set' },
          ]}
        />

        <SettingsTable
          toolbar={
            <>
              <label className="flex h-[48px] min-w-[220px] flex-1 items-center gap-3 rounded-[12px] border border-line bg-white px-4 sm:max-w-[360px]">
                <Search size={15} className="text-ink-2" />
                <span className="sr-only">Search locations</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search locations" className="h-full flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-muted" />
              </label>
              <div className="w-[180px]">
                <SelectField label="" aria-label="Filter by status" options={[{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} value={status} onChange={setStatus} wrapperClassName="[&>label]:hidden" />
              </div>
            </>
          }
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          template="grid-cols-[1.5fr_1.6fr_1fr_1.2fr_1.2fr_90px]"
          minWidth={980}
          emptyTitle="No locations found"
          emptyDescription="Add a location or clear your search and filters."
        />

        <LocationModal
          key={editing?.id ?? (adding ? 'new' : 'closed')}
          open={adding || editing !== null}
          initial={editing}
          takenPrimary={Boolean(primary) && primary?.id !== editing?.id}
          onClose={() => { setAdding(false); setEditing(null) }}
          onSubmit={async (v) => {
            if (editing) {
              const saved = await locations.update({ ...editing, ...v }, `${v.name} updated`)
              if (saved) await savePrimary(saved)
            } else {
              const saved = await locations.create(v, `${v.name} added`)
              if (saved) await savePrimary(saved)
            }
            setAdding(false)
            setEditing(null)
          }}
        />

        <ConfirmDialog
          open={toDelete !== null}
          danger
          title="Delete location?"
          message={
            toDelete?.primary
              ? 'This is your primary location. Make another location primary before deleting it.'
              : `“${toDelete?.name ?? ''}” and its operating hours will be removed. This cannot be undone.`
          }
          confirmLabel={toDelete?.primary ? 'OK' : 'Delete location'}
          onCancel={() => setToDelete(null)}
          onConfirm={async () => {
            if (toDelete && !toDelete.primary) await locations.remove(toDelete.id, `${toDelete.name} deleted`)
            setToDelete(null)
          }}
        />
      </div>
    </SectionState>
  )
}

interface ModalProps {
  open: boolean
  initial: SettingsLocation | null
  takenPrimary: boolean
  onClose: () => void
  onSubmit: (v: LocationDraft) => Promise<void>
}

function LocationModal({ open, initial, takenPrimary, onClose, onSubmit }: ModalProps) {
  const [v, setV] = useState<LocationDraft>(() => {
    if (!initial) return blank()
    const { id: _id, ...rest } = initial
    return structuredClone(rest)
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof LocationDraft>(k: K, val: LocationDraft[K]) => setV((p) => ({ ...p, [k]: val }))

  const setHours = (i: number, partial: Partial<OperatingHours>) =>
    setV((p) => ({ ...p, hours: p.hours.map((h, idx) => (idx === i ? { ...h, ...partial } : h)) }))

  const submit = async () => {
    const e: FormErrors = {}
    if (v.name.trim().length < 2) e.name = 'Location name is required'
    if (!v.address1.trim()) e.address1 = 'Address is required'
    if (!v.city.trim()) e.city = 'City is required'
    if (!v.state.trim()) e.state = 'State is required'
    if (!isZip(v.zip)) e.zip = 'Enter a valid ZIP / postal code'
    if (!v.country.trim()) e.country = 'Country is required'
    if (!isPhone(v.phone)) e.phone = 'Enter a valid phone number'
    if (!isEmail(v.email)) e.email = 'Enter a valid email address'
    if (v.hours.every((h) => h.closed)) e.hours = 'Open on at least one day'
    else if (v.hours.some((h) => !h.closed && h.open >= h.close)) e.hours = 'Closing time must be after opening time'
    if (v.primary && !v.active) e.active = 'The primary location must be active'
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    await onSubmit({ ...v, name: v.name.trim() })
    setBusy(false)
  }

  return (
    <SettingsModal open={open} size="lg" title={initial ? 'Edit location' : 'Add location'} description="Address, contact details and operating hours." submitLabel={initial ? 'Save changes' : 'Add location'} busy={busy} onClose={onClose} onSubmit={submit}>
      <FormGrid>
        <TextField label="Location name" value={v.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
        <SelectField label="Location type" options={TYPES} value={v.type} onChange={(t) => set('type', t as LocationType)} />
        <TextField label="Address line 1" value={v.address1} onChange={(e) => set('address1', e.target.value)} error={errors.address1} />
        <TextField label="Address line 2" value={v.address2} onChange={(e) => set('address2', e.target.value)} placeholder="Suite, floor (optional)" />
        <TextField label="City" value={v.city} onChange={(e) => set('city', e.target.value)} error={errors.city} />
        <TextField label="State / region" value={v.state} onChange={(e) => set('state', e.target.value)} error={errors.state} />
        <TextField label="ZIP / postal code" value={v.zip} onChange={(e) => set('zip', e.target.value)} error={errors.zip} />
        <TextField label="Country" value={v.country} onChange={(e) => set('country', e.target.value)} error={errors.country} />
        <TextField label="Phone number" value={v.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
        <TextField label="Email" type="email" value={v.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
      </FormGrid>
      <SelectField label="Time zone" options={TIMEZONES} value={v.timezone} onChange={(t) => set('timezone', t)} />

      <fieldset>
        <legend className="mb-2.5 text-[14px] font-semibold text-ink">Operating hours</legend>
        <div className="space-y-2 rounded-[14px] border border-line-2 p-3">
          {v.hours.map((h, i) => (
            <div key={h.day} className="grid grid-cols-[88px_1fr_1fr] items-center gap-3 sm:grid-cols-[110px_90px_1fr_1fr]">
              <span className="text-[14px] text-ink-2">{h.day}</span>
              <label className="col-span-2 flex items-center gap-2 text-[13px] text-muted sm:col-span-1">
                <input type="checkbox" checked={h.closed} onChange={(e) => setHours(i, { closed: e.target.checked })} className="h-4 w-4 accent-[#12c2e6]" />
                Closed
              </label>
              <input type="time" aria-label={`${h.day} opens`} disabled={h.closed} value={h.open} onChange={(e) => setHours(i, { open: e.target.value })} className="h-10 rounded-[10px] border border-line bg-white px-3 text-[14px] disabled:opacity-40" />
              <input type="time" aria-label={`${h.day} closes`} disabled={h.closed} value={h.close} onChange={(e) => setHours(i, { close: e.target.value })} className="h-10 rounded-[10px] border border-line bg-white px-3 text-[14px] disabled:opacity-40" />
            </div>
          ))}
        </div>
        {errors.hours && <p role="alert" className="mt-1.5 text-[13px] text-bad">{errors.hours}</p>}
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <SettingsToggle title="Primary location" description={takenPrimary ? 'Replaces the current primary location' : 'Shown first across the portal'} checked={v.primary} onChange={(p) => set('primary', p)} />
        <div>
          <SettingsToggle title="Active" description="Inactive locations cannot be booked" checked={v.active} onChange={(a) => set('active', a)} />
          {errors.active && <p role="alert" className="mt-1.5 text-[13px] text-bad">{errors.active}</p>}
        </div>
      </div>
    </SettingsModal>
  )
}
