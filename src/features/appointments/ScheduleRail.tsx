import { AlertTriangle, CheckCircle2, ChevronDown, Plus, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Dropdown } from '@/components/common/Dropdown'
import type { ScheduleAlert, WaitingEntry } from '@/types'
import { cn } from '@/utils/cn'

export function AlertsCard({ alerts, onAction }: { alerts: ScheduleAlert[]; onAction: (alert: ScheduleAlert) => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between p-[22px] pb-4">
        <div>
          <h2 className="text-[17px] font-semibold text-ink">AI &amp; Alerts</h2>
          <p className="mt-1.5 text-[13px] text-muted">Updated 1 min ago</p>
        </div>
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-brand-100 text-[13px] font-semibold text-brand-700">
          {alerts.length}
        </span>
      </div>
      <ul>
        {alerts.map((a, i) => (
          <li key={a.id} className="flex gap-3 border-t border-line-2 px-[22px] py-[15px]">
            <span className="mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              {i === alerts.length - 1 ? <CheckCircle2 size={14} /> : <AlertTriangle size={13} />}
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-ink">{a.title}</p>
              <p className="mt-0.5 text-[12.5px] text-muted">{a.body}</p>
              {a.action && (
                <button
                  type="button"
                  onClick={() => onAction(a)}
                  className="mt-3 h-[38px] rounded-full bg-brand-100/80 px-5 text-[13px] font-semibold text-brand-700 transition hover:bg-brand-200/70"
                >
                  {a.action}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function WaitingQueue({ entries }: { entries: WaitingEntry[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between p-[22px] pb-3">
        <div>
          <h2 className="text-[17px] font-semibold text-ink">Waiting Queue</h2>
          <p className="mt-1.5 text-[13px] text-muted">{entries.length} patients waiting</p>
        </div>
        <Badge tone="warn" size="sm">
          Live
        </Badge>
      </div>
      <ul>
        {entries.map((e) => (
          <li key={e.id} className="flex items-center justify-between border-t border-line-2 px-[22px] py-[10px]">
            <div>
              <p className="text-[13px] font-semibold text-ink">{e.name}</p>
              <p className="text-[12px] text-muted">{e.meta}</p>
            </div>
            <Badge tone="ok" size="sm">
              Waiting
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  )
}

interface QuickBookProps {
  providers: string[]
  onBook: (input: { patient: string; provider: string; visitType: string; duration: string }) => void
}

const VISIT_TYPES = ['In-Person', 'Video Visit', 'Phone Call']
const DURATIONS = ['15 min', '30 min', '45 min', '60 min']

export function QuickBook({ providers, onBook }: QuickBookProps) {
  const [patient, setPatient] = useState('')
  const [provider, setProvider] = useState('')
  const [visitType, setVisitType] = useState('')
  const [duration, setDuration] = useState('30 min')
  const [slot, setSlot] = useState('Next Available · 09:15 AM')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!patient.trim()) next.patient = 'Enter a patient name or MRN'
    if (!provider) next.provider = 'Select a provider'
    if (!visitType) next.visitType = 'Select a visit type'
    setErrors(next)
    if (Object.keys(next).length) return
    onBook({ patient: patient.trim(), provider, visitType, duration })
    setPatient('')
    setProvider('')
    setVisitType('')
  }

  const label = 'mb-2 block text-[12px] font-medium text-ink-2'
  const err = (k: string) => errors[k] && <p role="alert" className="mt-1 text-[12px] text-bad">{errors[k]}</p>

  return (
    <Card className="overflow-hidden">
      <div className="p-[22px] pb-4">
        <h2 className="text-[17px] font-semibold text-ink">Quick Book</h2>
        <p className="mt-1.5 text-[13px] text-muted">Same-day slot</p>
      </div>
      <form onSubmit={submit} noValidate className="space-y-[10px] border-t border-line-2 p-[22px] pt-4">
        <div>
          <label htmlFor="qb-patient" className={label}>
            Patient / MRN
          </label>
          <div className={cn('flex h-[40px] items-center gap-2.5 rounded-[12px] border bg-white px-3.5', errors.patient ? 'border-bad' : 'border-line')}>
            <Search size={15} className="text-ink-2" />
            <input
              id="qb-patient"
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
              placeholder="Search patient..."
              className="h-full flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted"
            />
            <ChevronDown size={15} className="text-ink-2" />
          </div>
          {err('patient')}
        </div>
        <div>
          <span className={label}>Provider</span>
          <Dropdown
            variant="field"
            label="Provider"
            value={provider}
            onChange={setProvider}
            display={<span className={provider ? '' : 'text-muted'}>{provider || 'Select provider'}</span>}
            options={providers.map((p) => ({ value: p, label: p }))}
            className="[&>button]:!h-[40px] [&>button]:!text-[13px]"
          />
          {err('provider')}
        </div>
        <div>
          <span className={label}>Visit Type</span>
          <Dropdown
            variant="field"
            label="Visit type"
            value={visitType}
            onChange={setVisitType}
            display={<span className={visitType ? '' : 'text-muted'}>{visitType || 'Select visit type'}</span>}
            options={VISIT_TYPES.map((v) => ({ value: v, label: v }))}
            className="[&>button]:!h-[40px] [&>button]:!text-[13px]"
          />
          {err('visitType')}
        </div>
        <div>
          <span className={label}>Duration</span>
          <Dropdown
            variant="field"
            label="Duration"
            value={duration}
            onChange={setDuration}
            options={DURATIONS.map((v) => ({ value: v, label: v }))}
            className="[&>button]:!h-[40px] [&>button]:!text-[13px]"
          />
        </div>
        <div>
          <span className={label}>Slot Time</span>
          <Dropdown
            variant="field"
            label="Slot time"
            value={slot}
            onChange={setSlot}
            options={['Next Available · 09:15 AM', '10:15 AM', '01:30 PM', '03:00 PM'].map((v) => ({ value: v, label: v }))}
            className="[&>button]:!h-[40px] [&>button]:!text-[13px]"
          />
        </div>
        <Button type="submit" variant="primary" fullWidth className="!h-[46px] !rounded-full !text-[13.5px]" icon={<Plus size={15} />}>
          Book Appointment
        </Button>
      </form>
    </Card>
  )
}
