import { useSyncedState } from '@/hooks/useSyncedState'
import { Building2, DoorOpen, MapPin, Plus } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Modal } from '@/components/common/Modal'
import { ErrorState, PageSkeleton } from '@/components/common/States'
import { useToast } from '@/components/common/Toast'
import { TextField } from '@/components/forms/Fields'
import { FormDialog } from '@/components/forms/FormDialog'
import { useZodForm } from '@/hooks/useZodForm'
import { locationSchema } from '@/schemas/common'
import { useAsync } from '@/hooks/useAsync'
import { clinicService } from '@/services/clinicService'
import type { ClinicLocation } from '@/types'
import { cn } from '@/utils/cn'

function LocationCard({ loc, onEdit, onRooms }: { loc: ClinicLocation; onEdit: () => void; onRooms: () => void }) {
  return (
    <Card className="rounded-[28px] p-[26px] pb-[24px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[15px] bg-linear-to-b from-[#26d3ef] to-[#10bfe3] text-white shadow-[0_8px_18px_rgba(21,200,233,0.3)]">
            <Building2 size={23} strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[17.5px] font-bold text-ink">{loc.name}</h3>
            <p className="mt-1 truncate text-[13.5px] text-muted">{loc.address}</p>
          </div>
        </div>
        <Badge tone={loc.online ? 'ok' : 'neutral'} dot size="sm" className="shrink-0 !text-[13.5px]">
          {loc.online ? 'Online' : 'Offline'}
        </Badge>
      </div>

      <dl className="mt-6 grid gap-4 min-[480px]:grid-cols-3">
        {(
          [
            ['Rooms', loc.rooms],
            ['Providers', loc.providers],
            ['Hours', loc.hours],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="min-w-0 rounded-[18px] border border-line-2 bg-linear-to-b from-brand-50/50 to-white px-[18px] py-[15px]">
            <dt className="text-[12.5px] text-muted">{k}</dt>
            <dd className="mt-2 truncate text-[15.5px] font-bold text-ink" title={v}>
              {v}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button className="!h-[50px] !rounded-[14px] !px-5 !text-[15.5px]" icon={<DoorOpen size={18} />} onClick={onRooms}>
          Rooms
        </Button>
        <Button variant="ghost" className="!h-[50px] !text-[15.5px] !text-ink-2" icon={<MapPin size={18} />} onClick={onEdit}>
          Edit Location
        </Button>
      </div>
    </Card>
  )
}

export default function ClinicPage() {
  const { data, loading, error, reload } = useAsync(clinicService.get)
  const notify = useToast()
  const [locations, setLocations] = useSyncedState<ClinicLocation[]>(data, () => data?.locations ?? [])
  const [adding, setAdding] = useState(false)
  const [roomsFor, setRoomsFor] = useState<ClinicLocation | null>(null)
  const [editing, setEditing] = useState<ClinicLocation | null>(null)

  if (loading) return <PageSkeleton cards={4} />
  if (error || !data) return <ErrorState message={error ?? 'Unable to load clinic data'} onRetry={reload} />

  const totalRooms = locations.reduce((n, l) => n + Number(l.rooms || 0), 0)
  const chips: { label: string; value: number; style: string }[] = [
    { label: 'Locations', value: locations.length, style: 'bg-[#e6f8fc] border-brand-200 text-brand-600' },
    { label: 'Rooms', value: Math.max(totalRooms, data.counts.rooms), style: 'bg-[#e6f8fc] border-brand-200 text-brand-600' },
    { label: 'Providers', value: data.counts.providers, style: 'bg-ok-bg/70 border-[#bfeed7] text-ok' },
    { label: 'Service Lines', value: data.serviceLines.length, style: 'bg-white border-line text-ink' },
  ]

  return (
    <div className="space-y-[38px]">
      <Card className="rounded-[26px] p-[27px]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[27px] font-bold leading-tight tracking-[-0.025em] text-ink">Clinic Management</h1>
            <p className="mt-2 text-[16px] text-muted">Locations, rooms and service lines.</p>
          </div>
          <Button size="lg" variant="primary" className="!h-[50px] !rounded-[16px] !px-7 !text-[16px]" icon={<Plus size={18} />} onClick={() => setAdding(true)}>
            Add Location
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap gap-4">
          {chips.map((c) => (
            <span key={c.label} className={cn('flex h-[50px] items-center gap-3 rounded-[14px] border px-5 text-[16px]', c.style.split(' ').slice(0, 2).join(' '))}>
              <span className="text-muted">{c.label}</span>
              <span className={cn('font-bold', c.style.split(' ')[2])}>{c.value}</span>
            </span>
          ))}
        </div>
      </Card>

      <div className="grid gap-[26px] xl:grid-cols-3">
        {locations.map((l) => (
          <LocationCard key={l.id} loc={l} onEdit={() => setEditing(l)} onRooms={() => setRoomsFor(l)} />
        ))}
      </div>

      <Card className="rounded-[26px] p-[27px] pb-[32px]">
        <h2 className="text-[17.5px] font-bold tracking-[-0.01em] text-ink">Service Lines</h2>
        <p className="mt-2.5 text-[16px] text-muted">Offered across all locations</p>
        <ul className="mt-7 flex flex-wrap gap-x-[14px] gap-y-4">
          {data.serviceLines.map((s) => (
            <li key={s} className="rounded-full border border-line-2 bg-linear-to-b from-brand-50/60 to-white px-[19px] py-[10px] text-[15.5px] font-semibold text-ink shadow-soft">
              {s}
            </li>
          ))}
        </ul>
      </Card>

      <RoomsDialog location={roomsFor} onClose={() => setRoomsFor(null)} onChange={(id, rooms) => { setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, rooms: String(rooms) } : l))); setRoomsFor((cur) => (cur && cur.id === id ? { ...cur, rooms: String(rooms) } : cur)) }} />
      <LocationModal
        key={editing?.id ?? 'new'}
        open={adding || editing !== null}
        initial={editing}
        onClose={() => {
          setAdding(false)
          setEditing(null)
        }}
        onSubmit={async (values) => {
          if (editing) {
            setLocations((prev) => prev.map((l) => (l.id === editing.id ? { ...l, ...values } : l)))
            notify(`${values.name} updated`)
          } else {
            const created = await clinicService.addLocation(values)
            setLocations((prev) => [...prev, created])
            notify(`${created.name} added`)
          }
          setAdding(false)
          setEditing(null)
        }}
      />
    </div>
  )
}

interface LocationModalProps {
  open: boolean
  initial: ClinicLocation | null
  onClose: () => void
  onSubmit: (values: { name: string; address: string }) => Promise<void>
}

function LocationModal({ open, initial, onClose, onSubmit }: LocationModalProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useZodForm(locationSchema, {
    defaultValues: { name: initial?.name ?? '', address: initial?.address ?? '' },
  })
  const submit = handleSubmit(async (v) => {
    await onSubmit(v)
  })
  return (
    <FormDialog
      open={open}
      title={initial ? 'Edit location' : 'Add location'}
      description={initial ? 'Update the location details (demo data).' : 'Create a new clinic location (demo data).'}
      submitLabel={initial ? 'Save changes' : 'Add location'}
      busy={isSubmitting}
      onClose={onClose}
      onSubmit={submit}
    >
      <TextField label="Location name" placeholder="e.g. Bayview Clinic" error={errors.name?.message} {...register('name')} />
      <TextField label="Address" placeholder="Street, City, State" error={errors.address?.message} {...register('address')} />
    </FormDialog>
  )
}

function RoomsDialog({ location, onClose, onChange }: { location: ClinicLocation | null; onClose: () => void; onChange: (id: string, rooms: number) => void }) {
  const count = Number(location?.rooms ?? 0)
  return (
    <Modal
      open={location !== null}
      onClose={onClose}
      title={`${location?.name ?? ''} rooms`}
      description="Add or remove rooms for this location (demo data)."
      footer={<Button onClick={onClose}>Done</Button>}
    >
      <div className="flex items-center justify-between gap-4 rounded-[14px] border border-line-2 p-4">
        <div>
          <p className="text-[13px] text-muted">Total rooms</p>
          <p className="text-[28px] font-bold text-ink" aria-live="polite">{count}</p>
        </div>
        <div className="flex gap-2">
          <Button aria-label="Remove a room" disabled={count <= 0} onClick={() => location && onChange(location.id, count - 1)}>
            −
          </Button>
          <Button variant="primary" aria-label="Add a room" disabled={count >= 60} onClick={() => location && onChange(location.id, count + 1)}>
            +
          </Button>
        </div>
      </div>
      {count > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-2 text-[13.5px] sm:grid-cols-4">
          {Array.from({ length: Math.min(count, 12) }, (_, i) => (
            <li key={i} className="rounded-[10px] border border-line-2 bg-tint px-3 py-2 text-center text-ink-2">Room {i + 1}</li>
          ))}
          {count > 12 && <li className="px-3 py-2 text-center text-muted">+{count - 12} more</li>}
        </ul>
      )}
    </Modal>
  )
}
