import { useSettingsForm, type FormErrors } from '@/hooks/useSettingsForm'
import { Toggle } from '@/components/common/Toggle'
import { settingsApi } from '@/services/settingsService'
import type { NotificationEvent, NotificationSettings } from '@/types'
import { inRange } from '@/utils/validation'
import { SaveBar } from '../components/SaveChangesButton'
import { SectionState } from '../components/SectionState'
import { SettingsCard } from '../components/SettingsCard'
import { ChipSelect, NumberField, TextField } from '../components/SettingsFormField'
import { SettingsToggle } from '../components/SettingsToggle'

type Channel = 'email' | 'sms' | 'inApp'
const CHANNELS: { key: Channel; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
  { key: 'inApp', label: 'In-app' },
]
const HOURS = [72, 48, 24, 12, 2, 1]

const validate = (n: NotificationSettings): FormErrors => {
  const e: FormErrors = {}
  if (n.appointmentReminderHours.length === 0) e.appointmentReminderHours = 'Select at least one reminder time'
  if (!inRange(n.virtualReminderMinutes, 5, 1440)) e.virtualReminderMinutes = 'Between 5 and 1440 minutes'
  if (n.quietHoursEnabled && n.quietStart === n.quietEnd) e.quiet = 'Quiet hours start and end must differ'
  return e
}

export default function Notifications() {
  const form = useSettingsForm(settingsApi.notifications, validate)
  const { draft, patch, errors } = form

  const setEvent = (id: string, ch: Channel, value: boolean) => {
    if (!draft) return
    patch({ events: draft.events.map((e: NotificationEvent) => (e.id === id ? { ...e, [ch]: value } : e)) })
  }

  return (
    <SectionState loading={form.loading} error={form.loadError} onRetry={form.reload}>
      {draft && (
        <div className="space-y-5">
          <SettingsCard title="Notifications" subtitle="Choose how your team and patients stay informed">
            <div className="mt-6 grid gap-x-12 gap-y-6 md:grid-cols-3">
              {CHANNELS.map((c) => (
                <SettingsToggle
                  key={c.key}
                  title={`${c.label} notifications`}
                  description={`Master switch for all ${c.label.toLowerCase()} alerts`}
                  checked={draft.channels[c.key]}
                  onChange={(v) => patch({ channels: { ...draft.channels, [c.key]: v } })}
                />
              ))}
            </div>
          </SettingsCard>

          <SettingsCard title="Events" subtitle="Pick the channels for each type of notification">
            <div className="scrollbar-thin mt-5 overflow-x-auto" role="region" aria-label="Notification events" tabIndex={0}>
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="text-[12.5px] font-bold uppercase tracking-[0.05em] text-ink-2">
                    <th scope="col" className="pb-3 pr-4 font-bold">Event</th>
                    {CHANNELS.map((c) => (
                      <th key={c.key} scope="col" className="w-[100px] pb-3 text-center font-bold">{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {draft.events.map((ev) => (
                    <tr key={ev.id} className="border-t border-line-2">
                      <th scope="row" className="py-4 pr-4 text-left font-normal">
                        <p className="text-[15px] font-semibold text-ink">{ev.label}</p>
                        <p className="mt-1 text-[13px] text-faint">{ev.description}</p>
                      </th>
                      {CHANNELS.map((c) => (
                        <td key={c.key} className="text-center">
                          <span className={draft.channels[c.key] ? '' : 'opacity-40'}>
                            <Toggle checked={ev[c.key] && draft.channels[c.key]} onChange={(v) => setEvent(ev.id, c.key, v)} label={`${ev.label} by ${c.label}`} size="sm" />
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[12.5px] text-faint">Channels switched off above are disabled for every event.</p>
          </SettingsCard>

          <SettingsCard title="Timing" subtitle="When reminders are sent">
            <div className="mt-6 space-y-6">
              <ChipSelect
                label="Appointment reminders (before the visit)"
                options={HOURS.map((h) => ({ value: String(h), label: h >= 24 ? `${h / 24} day${h > 24 ? 's' : ''}` : `${h} hr` }))}
                selected={draft.appointmentReminderHours.map(String)}
                onChange={(v) => patch({ appointmentReminderHours: v.map(Number).toSorted((a, b) => b - a) })}
                error={errors.appointmentReminderHours}
              />
              <div className="max-w-[300px]">
                <NumberField label="Virtual consultation reminder" suffix="min" value={draft.virtualReminderMinutes} onChange={(v) => patch({ virtualReminderMinutes: v })} error={errors.virtualReminderMinutes} hint="Minutes before the video visit" />
              </div>
              <SettingsToggle title="Quiet hours" description="Hold non-urgent SMS and email notifications overnight" checked={draft.quietHoursEnabled} onChange={(v) => patch({ quietHoursEnabled: v })} />
              {draft.quietHoursEnabled && (
                <div className="grid max-w-[520px] gap-5 sm:grid-cols-2">
                  <TextField label="Quiet hours start" type="time" value={draft.quietStart} onChange={(e) => patch({ quietStart: e.target.value })} error={errors.quiet} />
                  <TextField label="Quiet hours end" type="time" value={draft.quietEnd} onChange={(e) => patch({ quietEnd: e.target.value })} />
                </div>
              )}
            </div>
          </SettingsCard>

          <SaveBar dirty={form.dirty} saving={form.saving} onSave={form.save} onCancel={form.reset} />
        </div>
      )}
    </SectionState>
  )
}
