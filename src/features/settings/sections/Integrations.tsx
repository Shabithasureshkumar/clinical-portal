import { Activity, Cable, Cloud, CreditCard, Database, FlaskConical, Mail, MessageSquare, Search, Video, CalendarDays, type LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SegmentedControl } from '@/components/common/SegmentedControl'
import { EmptyState } from '@/components/common/States'
import { useCollection } from '@/hooks/useCollection'
import type { FormErrors } from '@/hooks/useSettingsForm'
import { settingsApi } from '@/services/settingsService'
import type { IntegrationCategory, IntegrationItem } from '@/types'
import { SectionState } from '../components/SectionState'
import { SettingsCard } from '../components/SettingsCard'
import { SettingsHeader } from '../components/SettingsHeader'
import { SelectField, TextField } from '../components/SettingsFormField'
import { SettingsModal } from '../components/SettingsModal'

const CATEGORY_ICON: Record<IntegrationCategory, LucideIcon> = {
  'Electronic Health Records': Database,
  'Payment gateways': CreditCard,
  'Video consultation': Video,
  'Email services': Mail,
  'SMS services': MessageSquare,
  'Calendar services': CalendarDays,
  'Laboratory systems': FlaskConical,
}
const CATEGORIES = Object.keys(CATEGORY_ICON) as IntegrationCategory[]
const FILTERS = ['All', 'Connected', 'Disconnected'] as const
type Filter = (typeof FILTERS)[number]

export default function Integrations() {
  const integrations = useCollection(settingsApi.integrations)
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')
  const [configuring, setConfiguring] = useState<IntegrationItem | null>(null)
  const [toDisconnect, setToDisconnect] = useState<IntegrationItem | null>(null)

  const items = integrations.items
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) => {
      if (filter === 'Connected' && !i.connected) return false
      if (filter === 'Disconnected' && i.connected) return false
      return !q || `${i.name} ${i.description} ${i.category}`.toLowerCase().includes(q)
    })
  }, [items, filter, query])

  return (
    <SectionState loading={integrations.loading} error={integrations.error} onRetry={integrations.reload}>
      <div className="space-y-5">
        <SettingsHeader
          title="Integrations"
          description="Connect the tools your clinic already uses"
          stats={[
            { label: 'Available', value: items.length },
            { label: 'Connected', value: items.filter((i) => i.connected).length, tone: 'ok' },
            { label: 'Disconnected', value: items.filter((i) => !i.connected).length, tone: 'warn' },
            { label: 'Live (verified)', value: items.filter((i) => i.connected && !i.demo).length },
          ]}
        />

        <div className="flex items-start gap-3 rounded-[16px] border border-[#fde0a8] bg-[#fffaf0] px-5 py-4 text-[14px] text-[#8a5a00]" role="note">
          <Cloud size={18} className="mt-0.5 shrink-0" />
          <p>
            <strong>Demo mode.</strong> No backend is connected yet, so connecting an integration here does not verify credentials or exchange data with the vendor. Status labels marked “demo” will become live once real API connections are configured.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl label="Filter integrations" options={FILTERS} value={filter} onChange={setFilter} />
          <label className="flex h-[44px] min-w-[220px] flex-1 items-center gap-3 rounded-[12px] border border-line bg-white px-4 sm:max-w-[340px]">
            <Search size={15} className="text-ink-2" />
            <span className="sr-only">Search integrations</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search integrations" className="h-full flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-muted" />
          </label>
        </div>

        {visible.length === 0 && (
          <SettingsCard>
            <EmptyState title="No integrations match" description="Try a different filter or search." />
          </SettingsCard>
        )}

        {CATEGORIES.map((cat) => {
          const list = visible.filter((i) => i.category === cat)
          if (list.length === 0) return null
          const Icon = CATEGORY_ICON[cat]
          return (
            <SettingsCard key={cat} title={cat} subtitle={`${list.filter((i) => i.connected).length} of ${list.length} connected`}>
              <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {list.map((i) => (
                  <li key={i.id} className="min-w-0 rounded-[16px] border border-line-2 bg-white p-[17px] shadow-soft">
                    <div className="flex items-start gap-4">
                      <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[11px] bg-brand-50 text-brand-600">
                        <Icon size={19} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15.5px] font-bold text-ink">{i.name}</p>
                        <p className="mt-0.5 text-[13.5px] text-faint">{i.description}</p>
                      </div>
                      <Badge tone={i.connected ? 'ok' : 'neutral'} dot size="sm">{i.connected ? (i.demo ? 'Connected (demo)' : 'Connected') : 'Not connected'}</Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line-2 pt-3">
                      <p className="flex items-center gap-1.5 text-[12.5px] text-muted">
                        <Activity size={13} className={i.connected ? 'text-ok' : 'text-faint'} />
                        API: {i.connected ? (i.demo ? 'Demo, not verified' : 'Healthy') : 'Not configured'}
                        {i.lastChecked && <span className="text-faint"> · {i.lastChecked}</span>}
                      </p>
                      <div className="flex gap-2">
                        {i.connected ? (
                          <>
                            <Button size="sm" className="!h-[36px] !text-[13px]" onClick={() => setConfiguring(i)}>Configure</Button>
                            <Button size="sm" variant="danger" className="!h-[36px] !text-[13px]" icon={<Cable size={13} />} onClick={() => setToDisconnect(i)}>Disconnect</Button>
                          </>
                        ) : (
                          <Button size="sm" variant="soft" className="!h-[36px] !text-[13px]" onClick={() => setConfiguring(i)}>Connect</Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </SettingsCard>
          )
        })}

        <ConnectModal
          key={configuring?.id ?? 'none'}
          item={configuring}
          onClose={() => setConfiguring(null)}
          onSubmit={async (environment) => {
            if (!configuring) return
            await integrations.update(
              { ...configuring, connected: true, demo: true, environment, lastChecked: 'Just now (demo)' },
              `${configuring.name} ${configuring.connected ? 'configuration saved' : 'connected in demo mode'}`,
            )
            setConfiguring(null)
          }}
        />

        <ConfirmDialog
          open={toDisconnect !== null}
          danger
          title={`Disconnect ${toDisconnect?.name ?? 'integration'}?`}
          message="Data will stop syncing with this tool and features that depend on it will be unavailable until you reconnect."
          confirmLabel="Disconnect"
          onCancel={() => setToDisconnect(null)}
          onConfirm={async () => {
            if (toDisconnect) await integrations.update({ ...toDisconnect, connected: false, lastChecked: null }, `${toDisconnect.name} disconnected`)
            setToDisconnect(null)
          }}
        />
      </div>
    </SectionState>
  )
}

function ConnectModal({ item, onClose, onSubmit }: { item: IntegrationItem | null; onClose: () => void; onSubmit: (environment: IntegrationItem['environment']) => Promise<void> }) {
  const [apiKey, setApiKey] = useState('')
  const [environment, setEnvironment] = useState<IntegrationItem['environment']>(item?.environment ?? 'Sandbox')
  const [errors, setErrors] = useState<FormErrors>({})
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const e: FormErrors = {}
    if (!item?.connected && apiKey.trim().length < 8) e.apiKey = 'Enter an API key of at least 8 characters'
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    // The key is intentionally discarded: nothing is stored or verified until a backend exists.
    await onSubmit(environment)
    setBusy(false)
  }

  return (
    <SettingsModal
      open={item !== null}
      title={item?.connected ? `Configure ${item.name}` : `Connect ${item?.name ?? ''}`}
      description="Demo mode: credentials are not stored or verified."
      submitLabel={item?.connected ? 'Save configuration' : 'Connect (demo)'}
      busy={busy}
      onClose={onClose}
      onSubmit={submit}
    >
      <TextField label={item?.connected ? 'API key (leave blank to keep current)' : 'API key'} type="password" autoComplete="off" value={apiKey} onChange={(e) => setApiKey(e.target.value)} error={errors.apiKey} />
      <SelectField label="Environment" options={['Sandbox', 'Production']} value={environment} onChange={(v) => setEnvironment(v as IntegrationItem['environment'])} hint="Production connections require a live backend." />
    </SettingsModal>
  )
}
