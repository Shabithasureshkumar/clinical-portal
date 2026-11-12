import { Download, LogOut, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/Toast'
import type { Column } from '@/components/tables/DataTable'
import { useAsync } from '@/hooks/useAsync'
import { useCollection } from '@/hooks/useCollection'
import { useSettingsForm, type FormErrors } from '@/hooks/useSettingsForm'
import { settingsApi } from '@/services/settingsService'
import type { ActiveSession, AuditLogItem, DataExportRequest, LoginActivityItem, SecuritySettings } from '@/types'
import { inRange } from '@/utils/validation'
import { SaveBar } from '../components/SaveChangesButton'
import { SectionState } from '../components/SectionState'
import { SettingsCard } from '../components/SettingsCard'
import { FormGrid, NumberField, SelectField } from '../components/SettingsFormField'
import { SettingsTable } from '../components/SettingsTable'
import { SettingsToggle } from '../components/SettingsToggle'

const EXPORT_SCOPES = ['Patient records', 'Billing and invoices', 'Audit logs', 'All clinic data']

const validate = (s: SecuritySettings): FormErrors => {
  const e: FormErrors = {}
  if (!inRange(s.passwordMinLength, 8, 64)) e.passwordMinLength = 'Between 8 and 64 characters'
  if (!inRange(s.passwordExpiryDays, 0, 365)) e.passwordExpiryDays = '0 (never) to 365 days'
  if (!inRange(s.sessionTimeoutMin, 5, 480)) e.sessionTimeoutMin = 'Between 5 and 480 minutes'
  if (!inRange(s.retentionYears, 1, 50)) e.retentionYears = 'Between 1 and 50 years'
  return e
}

type Pending = { kind: '2fa-off' } | { kind: 'retention'; years: number } | { kind: 'session'; session: ActiveSession } | { kind: 'export' } | null

export default function DataPrivacy() {
  const form = useSettingsForm(settingsApi.security, validate)
  const sessions = useCollection(settingsApi.sessions)
  const logins = useAsync(settingsApi.loginActivity.list)
  const audit = useAsync(settingsApi.auditLog.list)
  const exportsList = useAsync(settingsApi.dataExports.list)
  const notify = useToast()
  const { draft, patch, errors } = form

  const [pending, setPending] = useState<Pending>(null)
  const [scope, setScope] = useState(EXPORT_SCOPES[0] ?? '')
  const [auditQuery, setAuditQuery] = useState('')
  const [requests, setRequests] = useState<DataExportRequest[] | null>(null)

  const auditRows = useMemo(() => {
    const q = auditQuery.trim().toLowerCase()
    return (audit.data ?? []).filter((a) => !q || `${a.actor} ${a.action} ${a.target}`.toLowerCase().includes(q))
  }, [audit.data, auditQuery])

  const sessionColumns: Column<ActiveSession>[] = [
    { key: 'device', header: 'Device', render: (r) => <span className="text-[14.5px] font-semibold text-ink">{r.device}</span> },
    { key: 'loc', header: 'Location', render: (r) => <span className="text-[14px] text-muted">{r.location}</span> },
    { key: 'last', header: 'Last active', render: (r) => <span className="text-[14px] text-muted">{r.lastActive}</span> },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (r) => r.current ? <Badge tone="ok" size="sm">This device</Badge> : (
        <Button size="sm" variant="danger" className="!h-[34px] !text-[13px]" icon={<LogOut size={13} />} onClick={() => setPending({ kind: 'session', session: r })}>Sign out</Button>
      ),
    },
  ]
  const loginColumns: Column<LoginActivityItem>[] = [
    { key: 'user', header: 'User', render: (r) => <span className="text-[14.5px] font-semibold text-ink">{r.user}</span> },
    { key: 'result', header: 'Result', render: (r) => <Badge tone={r.result === 'Success' ? 'ok' : 'bad'} dot size="sm">{r.result}</Badge> },
    { key: 'ip', header: 'IP address', render: (r) => <span className="text-[14px] text-muted">{r.ip}</span> },
    { key: 'when', header: 'When', render: (r) => <span className="text-[14px] text-muted">{r.when}</span> },
  ]
  const auditColumns: Column<AuditLogItem>[] = [
    { key: 'actor', header: 'Actor', sortValue: (r) => r.actor, render: (r) => <span className="text-[14.5px] font-semibold text-ink">{r.actor}</span> },
    { key: 'action', header: 'Action', sortValue: (r) => r.action, render: (r) => <span className="text-[14px] text-ink-2">{r.action}</span> },
    { key: 'target', header: 'Target', render: (r) => <span className="text-[14px] text-muted">{r.target}</span> },
    { key: 'when', header: 'When', render: (r) => <span className="text-[14px] text-muted">{r.when}</span> },
  ]

  const confirmCopy = (): { title: string; message: string; label: string } => {
    switch (pending?.kind) {
      case '2fa-off':
        return { title: 'Turn off two-factor authentication?', message: 'Accounts will rely on passwords alone, which makes them easier to compromise. Apply this change with Save changes.', label: 'Turn off' }
      case 'retention':
        return { title: 'Shorten data retention?', message: `Reducing retention to ${pending.years} years may cause older records to become eligible for deletion once saved. Confirm only if this matches your policy.`, label: 'Shorten retention' }
      case 'session':
        return { title: 'Sign out this device?', message: `${pending.session.device} will be signed out immediately.`, label: 'Sign out' }
      case 'export':
        return { title: 'Request data export?', message: `A request for “${scope}” will be created. Exports contain sensitive patient information. In this demo no file is generated.`, label: 'Request export' }
      default:
        return { title: '', message: '', label: 'Confirm' }
    }
  }
  const copy = confirmCopy()

  const onConfirm = async () => {
    if (!pending) return
    if (pending.kind === '2fa-off') patch({ twoFactorEnabled: false })
    else if (pending.kind === 'retention') patch({ retentionYears: pending.years })
    else if (pending.kind === 'session') await sessions.remove(pending.session.id, 'Device signed out')
    else if (pending.kind === 'export') {
      const req = await settingsApi.dataExports.request(scope)
      setRequests((prev) => [req, ...(prev ?? exportsList.data ?? [])])
      notify('Export requested (demo): no file is generated until a backend is connected')
    }
    setPending(null)
  }

  const shownRequests = requests ?? exportsList.data ?? []

  return (
    <SectionState loading={form.loading || sessions.loading} error={form.loadError ?? sessions.error} onRetry={form.reload}>
      {draft && (
        <div className="space-y-5">
          <SettingsCard title="Data & privacy" subtitle="Security, access controls and data retention">
            <div className="mt-5 rounded-[14px] border border-line-2 bg-tint px-4 py-3 text-[13px] text-muted" role="note">
              These controls configure the portal only. They are not a compliance certification, and enforcement requires a connected, reviewed backend.
            </div>
          </SettingsCard>

          <SettingsCard title="Authentication" subtitle="Protect staff accounts">
            <div className="mt-6 space-y-6">
              <SettingsToggle title="Two-factor authentication" description="Require a second step when staff sign in" checked={draft.twoFactorEnabled} onChange={(v) => (v ? patch({ twoFactorEnabled: true }) : setPending({ kind: '2fa-off' }))} />
              {draft.twoFactorEnabled && (
                <div className="max-w-[360px]">
                  <SelectField label="Verification method" options={['Authenticator app', 'SMS code']} value={draft.twoFactorMethod} onChange={(v) => patch({ twoFactorMethod: v as SecuritySettings['twoFactorMethod'] })} />
                </div>
              )}
              <FormGrid cols={3}>
                <NumberField label="Minimum password length" value={draft.passwordMinLength} onChange={(v) => patch({ passwordMinLength: v })} error={errors.passwordMinLength} />
                <NumberField label="Password expiry" suffix="days" value={draft.passwordExpiryDays} onChange={(v) => patch({ passwordExpiryDays: v })} error={errors.passwordExpiryDays} hint="0 means never" />
                <NumberField label="Session timeout" suffix="min" value={draft.sessionTimeoutMin} onChange={(v) => patch({ sessionTimeoutMin: v })} error={errors.sessionTimeoutMin} hint="Inactivity before sign-out" />
              </FormGrid>
              <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                <SettingsToggle title="Require symbols" checked={draft.requireSymbols} onChange={(v) => patch({ requireSymbols: v })} />
                <SettingsToggle title="Require upper & lower case" checked={draft.requireMixedCase} onChange={(v) => patch({ requireMixedCase: v })} />
              </div>
            </div>
          </SettingsCard>

          <SettingsCard title="Data access & patient privacy" subtitle="Limit who can see sensitive information">
            <div className="mt-6 grid gap-x-12 gap-y-6 md:grid-cols-2">
              <SettingsToggle title="Restrict billing data" description="Only billing staff and administrators" checked={draft.restrictBillingAccess} onChange={(v) => patch({ restrictBillingAccess: v })} />
              <SettingsToggle title="Restrict clinical notes" description="Only clinical roles at the patient’s location" checked={draft.restrictClinicalNotes} onChange={(v) => patch({ restrictClinicalNotes: v })} />
              <SettingsToggle title="Mask patient identifiers" description="Partially hide MRN and contact details in lists" checked={draft.maskPatientIdentifiers} onChange={(v) => patch({ maskPatientIdentifiers: v })} />
              <SettingsToggle title="Require reason for record access" description="Prompt staff to state why they opened a record" checked={draft.requireReasonForRecordAccess} onChange={(v) => patch({ requireReasonForRecordAccess: v })} />
            </div>
          </SettingsCard>

          <SettingsCard title="Data retention" subtitle="How long records are kept">
            <div className="mt-6 space-y-6">
              <div className="max-w-[300px]">
                <NumberField
                  label="Retention period"
                  suffix="yrs"
                  value={draft.retentionYears}
                  onChange={(v) => (v < draft.retentionYears && inRange(v, 1, 50) ? setPending({ kind: 'retention', years: v }) : patch({ retentionYears: v }))}
                  error={errors.retentionYears}
                />
              </div>
              <SettingsToggle title="Anonymise inactive patient data" description="De-identify records after the retention period instead of keeping them" checked={draft.autoAnonymiseInactive} onChange={(v) => patch({ autoAnonymiseInactive: v })} />
            </div>
          </SettingsCard>

          <SaveBar dirty={form.dirty} saving={form.saving} onSave={form.save} onCancel={form.reset} />

          <SettingsTable title="Active sessions" subtitle="Devices currently signed in to your account" columns={sessionColumns} rows={sessions.items} rowKey={(r) => r.id} template="grid-cols-[1.6fr_1.2fr_1fr_130px]" minWidth={640} emptyTitle="No active sessions" />
          <SettingsTable title="Login activity" subtitle="Recent sign-in attempts" columns={loginColumns} rows={logins.data ?? []} rowKey={(r) => r.id} template="grid-cols-[1.4fr_1fr_1.2fr_1.2fr]" minWidth={600} emptyTitle={logins.loading ? 'Loading…' : 'No login activity'} />
          <SettingsTable
            title="Audit log"
            subtitle="Who changed or viewed what"
            toolbar={
              <label className="flex h-[48px] w-full max-w-[340px] items-center gap-3 rounded-[12px] border border-line bg-white px-4">
                <Search size={15} className="text-ink-2" />
                <span className="sr-only">Search audit log</span>
                <input value={auditQuery} onChange={(e) => setAuditQuery(e.target.value)} placeholder="Search audit log" className="h-full flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-muted" />
              </label>
            }
            columns={auditColumns}
            rows={auditRows}
            rowKey={(r) => r.id}
            template="grid-cols-[1.2fr_1.6fr_1.2fr_1.1fr]"
            minWidth={680}
            emptyTitle={audit.loading ? 'Loading…' : 'No matching entries'}
          />

          <SettingsCard title="Data export" subtitle="Request a copy of your clinic data">
            <div className="mt-6 flex flex-wrap items-end gap-4">
              <div className="w-full max-w-[320px]">
                <SelectField label="What to export" options={EXPORT_SCOPES} value={scope} onChange={setScope} />
              </div>
              <Button variant="primary" icon={<Download size={16} />} onClick={() => setPending({ kind: 'export' })}>Request export</Button>
            </div>
            {shownRequests.length > 0 && (
              <ul className="mt-6 space-y-2">
                {shownRequests.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-line-2 px-4 py-3 text-[14px]">
                    <span className="font-semibold text-ink">{r.scope}</span>
                    <span className="text-muted">{r.requestedAt}</span>
                    <Badge tone="warn" size="sm">{r.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </SettingsCard>

          <ConfirmDialog open={pending !== null} danger={pending?.kind !== 'export'} title={copy.title} message={copy.message} confirmLabel={copy.label} onCancel={() => setPending(null)} onConfirm={onConfirm} />
        </div>
      )}
    </SectionState>
  )
}
