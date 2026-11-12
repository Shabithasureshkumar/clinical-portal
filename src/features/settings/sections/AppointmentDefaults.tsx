import { useSettingsForm, type FormErrors } from '@/hooks/useSettingsForm'
import { WEEKDAYS_SHORT } from '@/constants/settings'
import { settingsApi } from '@/services/settingsService'
import type { AppointmentDefaults as Defaults } from '@/types'
import { inRange } from '@/utils/validation'
import { SaveBar } from '../components/SaveChangesButton'
import { SectionState } from '../components/SectionState'
import { SettingsCard } from '../components/SettingsCard'
import { ChipSelect, FormGrid, NumberField, SelectField } from '../components/SettingsFormField'
import { SettingsToggle } from '../components/SettingsToggle'

const CANCEL_POLICIES = [
  'Free cancellation up to the window, then a late-cancel fee may apply',
  'Cancellation allowed at any time',
  'Cancellation requires staff approval',
]
const RESCHEDULE_POLICIES = [
  'Patients can reschedule up to the cancellation window',
  'Patients can reschedule at any time',
  'Rescheduling requires staff approval',
]
const TYPES = ['New patient visit', 'Follow-up visit', 'Annual wellness visit', 'Consultation', 'Procedure']
const REMINDER_OPTIONS = [72, 48, 24, 12, 2, 1]

const validate = (d: Defaults): FormErrors => {
  const e: FormErrors = {}
  if (!inRange(d.durationMin, 5, 240)) e.durationMin = 'Between 5 and 240 minutes'
  if (!inRange(d.bufferMin, 0, 120)) e.bufferMin = 'Between 0 and 120 minutes'
  if (!inRange(d.minNoticeHours, 0, 720)) e.minNoticeHours = 'Between 0 and 720 hours'
  if (!inRange(d.maxAdvanceDays, 1, 730)) e.maxAdvanceDays = 'Between 1 and 730 days'
  if (!inRange(d.cancellationWindowHours, 0, 720)) e.cancellationWindowHours = 'Between 0 and 720 hours'
  if (!inRange(d.rescheduleLimit, 0, 20)) e.rescheduleLimit = 'Between 0 and 20'
  if (d.workingDays.length === 0) e.workingDays = 'Select at least one working day'
  if (d.reminderEnabled && d.reminderTimings.length === 0) e.reminderTimings = 'Select at least one reminder time'
  return e
}

export default function AppointmentDefaults() {
  const form = useSettingsForm(settingsApi.appointmentDefaults, validate)
  const { draft, patch, errors } = form

  return (
    <SectionState loading={form.loading} error={form.loadError} onRetry={form.reload}>
      {draft && (
        <div className="space-y-5">
          <SettingsCard title="Appointment defaults" subtitle="Make booking consistent across your organization">
            <div className="mt-6 space-y-6">
              <FormGrid>
                <NumberField label="Default appointment duration" suffix="min" value={draft.durationMin} onChange={(v) => patch({ durationMin: v })} error={errors.durationMin} />
                <NumberField label="Buffer time between appointments" suffix="min" value={draft.bufferMin} onChange={(v) => patch({ bufferMin: v })} error={errors.bufferMin} />
                <NumberField label="Minimum booking notice" suffix="hrs" value={draft.minNoticeHours} onChange={(v) => patch({ minNoticeHours: v })} error={errors.minNoticeHours} hint="How far ahead patients must book" />
                <NumberField label="Maximum advance booking" suffix="days" value={draft.maxAdvanceDays} onChange={(v) => patch({ maxAdvanceDays: v })} error={errors.maxAdvanceDays} />
                <SelectField label="Default appointment type" options={TYPES} value={draft.defaultAppointmentType} onChange={(v) => patch({ defaultAppointmentType: v })} />
                <SelectField label="Default consultation mode" options={['In-person', 'Virtual']} value={draft.defaultMode} onChange={(v) => patch({ defaultMode: v as Defaults['defaultMode'] })} />
              </FormGrid>
              <ChipSelect label="Working days" options={WEEKDAYS_SHORT.map((d) => ({ value: d, label: d }))} selected={draft.workingDays} onChange={(v) => patch({ workingDays: v })} error={errors.workingDays} />
            </div>
          </SettingsCard>

          <SettingsCard title="Cancellation & rescheduling" subtitle="Policies shown to patients when they book">
            <div className="mt-6 space-y-6">
              <FormGrid>
                <SelectField label="Cancellation policy" options={CANCEL_POLICIES} value={draft.cancellationPolicy} onChange={(v) => patch({ cancellationPolicy: v })} />
                <NumberField label="Cancellation window" suffix="hrs" value={draft.cancellationWindowHours} onChange={(v) => patch({ cancellationWindowHours: v })} error={errors.cancellationWindowHours} hint="Hours before the visit" />
                <SelectField label="Rescheduling policy" options={RESCHEDULE_POLICIES} value={draft.reschedulePolicy} onChange={(v) => patch({ reschedulePolicy: v })} />
                <NumberField label="Reschedules allowed per appointment" value={draft.rescheduleLimit} onChange={(v) => patch({ rescheduleLimit: v })} error={errors.rescheduleLimit} />
              </FormGrid>
            </div>
          </SettingsCard>

          <SettingsCard title="Confirmation & reminders" subtitle="Automate confirmations and patient reminders">
            <div className="mt-6 space-y-7">
              <SettingsToggle title="Automatic appointment confirmation" description="Confirm bookings instantly instead of waiting for staff approval" checked={draft.autoConfirm} onChange={(v) => patch({ autoConfirm: v })} />
              <SettingsToggle title="Appointment reminders" description="Send reminders to patients before their visit" checked={draft.reminderEnabled} onChange={(v) => patch({ reminderEnabled: v })} />
              {draft.reminderEnabled && (
                <div className="space-y-5 rounded-[16px] border border-line-2 bg-tint p-5">
                  <ChipSelect
                    label="Send reminders before the visit"
                    options={REMINDER_OPTIONS.map((h) => ({ value: String(h), label: h >= 24 ? `${h / 24} day${h > 24 ? 's' : ''}` : `${h} hr` }))}
                    selected={draft.reminderTimings.map(String)}
                    onChange={(v) => patch({ reminderTimings: v.map(Number).toSorted((a, b) => b - a) })}
                    error={errors.reminderTimings}
                  />
                  <ChipSelect
                    label="Reminder channels"
                    options={[{ value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }, { value: 'inApp', label: 'In-app' }]}
                    selected={Object.entries(draft.reminderChannels).filter(([, on]) => on).map(([k]) => k)}
                    onChange={(v) => patch({ reminderChannels: { email: v.includes('email'), sms: v.includes('sms'), inApp: v.includes('inApp') } })}
                  />
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
