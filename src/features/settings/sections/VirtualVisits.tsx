import { Badge } from '@/components/common/Badge'
import { useCollection } from '@/hooks/useCollection'
import { useSettingsForm, type FormErrors } from '@/hooks/useSettingsForm'
import { settingsApi } from '@/services/settingsService'
import type { VirtualVisitSettings } from '@/types'
import { inRange } from '@/utils/validation'
import { SaveBar } from '../components/SaveChangesButton'
import { SectionState } from '../components/SectionState'
import { SettingsCard } from '../components/SettingsCard'
import { FormGrid, NumberField, SelectField, TextAreaField, TextField } from '../components/SettingsFormField'
import { SettingsToggle } from '../components/SettingsToggle'

const PROVIDERS = ['Doxy.me', 'Zoom Healthcare', 'Google Meet', 'Microsoft Teams', 'Custom link']
const ACCESS = ['Secure link', 'Patient portal sign-in', 'Link + passcode']

const validate = (v: VirtualVisitSettings): FormErrors => {
  const e: FormErrors = {}
  if (v.enabled) {
    if (!/^https:\/\/\S+$/i.test(v.meetingLinkTemplate.trim())) e.meetingLinkTemplate = 'Enter a secure link that starts with https://'
    if (!inRange(v.patientJoinMinutesBefore, 0, 120)) e.patientJoinMinutesBefore = 'Between 0 and 120 minutes'
    if (!inRange(v.doctorJoinMinutesBefore, 0, 120)) e.doctorJoinMinutesBefore = 'Between 0 and 120 minutes'
    if (v.waitingRoom && v.waitingRoomMessage.length > 200) e.waitingRoomMessage = 'Keep the message under 200 characters'
    if (v.notifyReminder && !inRange(v.reminderMinutes, 5, 1440)) e.reminderMinutes = 'Between 5 and 1440 minutes'
  }
  if (v.preInstructions.length > 600) e.preInstructions = 'Keep instructions under 600 characters'
  return e
}

const matchesProvider = (integrationName: string, provider: string): boolean =>
  provider.toLowerCase().startsWith(integrationName.toLowerCase().split(' ')[0] ?? '')

export default function VirtualVisits() {
  const form = useSettingsForm(settingsApi.virtualVisits, validate)
  const integrations = useCollection(settingsApi.integrations)
  const { draft, patch, errors } = form

  const linked = draft ? integrations.items.find((i) => i.category === 'Video consultation' && matchesProvider(i.name, draft.provider)) : undefined
  const configured = draft ? draft.enabled && /^https:\/\/\S+$/i.test(draft.meetingLinkTemplate.trim()) : false
  const off = draft ? !draft.enabled : false

  return (
    <SectionState loading={form.loading || integrations.loading} error={form.loadError ?? integrations.error} onRetry={form.reload}>
      {draft && (
        <div className="space-y-5">
          <SettingsCard title="Virtual visits" subtitle="Configure how video consultations are offered and joined">
            <div className="mt-6 space-y-6">
              <SettingsToggle title="Enable virtual visits" description="Allow patients to book and join video consultations" checked={draft.enabled} onChange={(v) => patch({ enabled: v })} />
              <div className="flex flex-wrap gap-3" aria-label="Virtual visit status">
                <Badge tone={configured ? 'ok' : 'warn'} dot>Configuration: {configured ? 'Complete' : draft.enabled ? 'Incomplete' : 'Disabled'}</Badge>
                <Badge tone={linked?.connected ? 'info' : 'neutral'} dot>
                  Connection: {linked?.connected ? `${linked.name} connected (demo)` : 'No live provider connected'}
                </Badge>
              </div>
              {linked?.demo && <p className="text-[13px] text-faint">Integrations run in demo mode until a backend is connected: no vendor credentials are verified.</p>}
            </div>
          </SettingsCard>

          <fieldset disabled={off} className={off ? 'space-y-5 opacity-60' : 'space-y-5'}>
            <SettingsCard title="Video provider & meeting links" subtitle="Where consultations take place">
              <div className="mt-6 space-y-5">
                <FormGrid>
                  <SelectField label="Video consultation provider" options={PROVIDERS} value={draft.provider} onChange={(v) => patch({ provider: v })} />
                  <SelectField label="Appointment access" options={ACCESS} value={draft.accessMode} onChange={(v) => patch({ accessMode: v as VirtualVisitSettings['accessMode'] })} hint="How patients authenticate before joining" />
                </FormGrid>
                <TextField label="Meeting link template" value={draft.meetingLinkTemplate} onChange={(e) => patch({ meetingLinkTemplate: e.target.value })} error={errors.meetingLinkTemplate} placeholder="https://" />
                <p className="-mt-3 text-[12.5px] text-faint">Placeholders {'{clinic-slug}'} and {'{appointment-id}'} are replaced when a visit is created.</p>
              </div>
            </SettingsCard>

            <SettingsCard title="Waiting room & join permissions" subtitle="Control who can join and when">
              <div className="mt-6 space-y-6">
                <SettingsToggle title="Waiting room" description="Hold patients in a virtual waiting room until the provider admits them" checked={draft.waitingRoom} onChange={(v) => patch({ waitingRoom: v })} />
                {draft.waitingRoom && <TextAreaField label="Waiting room message" value={draft.waitingRoomMessage} onChange={(e) => patch({ waitingRoomMessage: e.target.value })} error={errors.waitingRoomMessage} />}
                <FormGrid>
                  <NumberField label="Patients can join" suffix="min" value={draft.patientJoinMinutesBefore} onChange={(v) => patch({ patientJoinMinutesBefore: v })} error={errors.patientJoinMinutesBefore} hint="Minutes before the start time" />
                  <NumberField label="Doctors can join" suffix="min" value={draft.doctorJoinMinutesBefore} onChange={(v) => patch({ doctorJoinMinutesBefore: v })} error={errors.doctorJoinMinutesBefore} hint="Minutes before the start time" />
                </FormGrid>
                <SettingsToggle title="Allow guests" description="Let patients invite a family member or interpreter to the call" checked={draft.allowGuests} onChange={(v) => patch({ allowGuests: v })} />
              </div>
            </SettingsCard>

            <SettingsCard title="Audio, video & instructions" subtitle="Defaults for each call">
              <div className="mt-6 space-y-6">
                <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                  <SettingsToggle title="Audio on by default" checked={draft.audioOnByDefault} onChange={(v) => patch({ audioOnByDefault: v })} />
                  <SettingsToggle title="Video on by default" checked={draft.videoOnByDefault} onChange={(v) => patch({ videoOnByDefault: v })} />
                  <SettingsToggle title="Allow screen sharing" checked={draft.allowScreenShare} onChange={(v) => patch({ allowScreenShare: v })} />
                </div>
                <TextAreaField label="Pre-consultation instructions" value={draft.preInstructions} onChange={(e) => patch({ preInstructions: e.target.value })} error={errors.preInstructions} />
              </div>
            </SettingsCard>

            <SettingsCard title="Virtual visit notifications" subtitle="Messages sent around each video visit">
              <div className="mt-6 space-y-6">
                <SettingsToggle title="Send join link on booking" checked={draft.notifyLinkSent} onChange={(v) => patch({ notifyLinkSent: v })} />
                <SettingsToggle title="Send start-time reminder" checked={draft.notifyReminder} onChange={(v) => patch({ notifyReminder: v })} />
                {draft.notifyReminder && (
                  <div className="max-w-[300px]">
                    <NumberField label="Reminder lead time" suffix="min" value={draft.reminderMinutes} onChange={(v) => patch({ reminderMinutes: v })} error={errors.reminderMinutes} />
                  </div>
                )}
              </div>
            </SettingsCard>
          </fieldset>

          <SaveBar dirty={form.dirty} saving={form.saving} onSave={form.save} onCancel={form.reset} />
        </div>
      )}
    </SectionState>
  )
}
