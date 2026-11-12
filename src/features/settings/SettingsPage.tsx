import { ChevronRight, ExternalLink, Save } from 'lucide-react'
import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react'
import { Navigate, useBlocker, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { LogoMark } from '@/components/common/Logo'
import { Modal } from '@/components/common/Modal'
import { ErrorBoundary, Skeleton } from '@/components/common/States'
import { DEFAULT_SETTINGS_SECTION, findSection, settingsPath, type SettingsSectionMeta } from '@/constants/settings'
import { useAsync } from '@/hooks/useAsync'
import { settingsApi } from '@/services/settingsService'
import type { SettingsSectionId } from '@/types'
import { SettingsSidebar } from './components/SettingsSidebar'
import { SettingsProvider, useSettingsContext } from './SettingsContext'

const SECTION_COMPONENTS: Record<SettingsSectionId, ComponentType> = {
  'clinic-profile': lazy(() => import('./sections/ClinicProfile')),
  locations: lazy(() => import('./sections/Locations')),
  services: lazy(() => import('./sections/Services')),
  'appointment-defaults': lazy(() => import('./sections/AppointmentDefaults')),
  'virtual-visits': lazy(() => import('./sections/VirtualVisits')),
  'billing-insurance': lazy(() => import('./sections/BillingInsurance')),
  notifications: lazy(() => import('./sections/Notifications')),
  integrations: lazy(() => import('./sections/Integrations')),
  'user-management': lazy(() => import('./sections/UserManagement')),
  'data-privacy': lazy(() => import('./sections/DataPrivacy')),
  'help-legal': lazy(() => import('./sections/HelpLegal')),
}

export default function SettingsPage() {
  const { section } = useParams()
  const meta = findSection(section)
  if (!meta) return <Navigate to={settingsPath(DEFAULT_SETTINGS_SECTION)} replace />
  return (
    <SettingsProvider>
      <SettingsShell meta={meta} />
    </SettingsProvider>
  )
}

function SettingsShell({ meta }: { meta: SettingsSectionMeta }) {
  const { dirty, saving, hasForm, saveActive, resetActive } = useSettingsContext()
  const [preview, setPreview] = useState(false)
  const Section = SECTION_COMPONENTS[meta.id]

  // Block in-app navigation while the active form has unsaved changes.
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname)

  // Guard against closing or reloading the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-brand-600">
            Workspace <ChevronRight size={13} /> Administration
          </p>
          <h1 className="text-[32px] font-bold leading-[1.15] tracking-[-0.025em] text-ink sm:text-[36px]">Clinic settings</h1>
          <p className="mt-2.5 text-[16px] text-muted">Configure your clinic experience, workflows, and connections.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setPreview(true)} iconRight={<ExternalLink size={14} />}>
            Preview patient view
          </Button>
          <Button variant="primary" icon={<Save size={16} />} onClick={saveActive} disabled={!hasForm || !dirty || saving} title={hasForm ? undefined : 'This section saves changes as you make them'}>
            {saving ? 'Saving…' : 'Save all changes'}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[240px_minmax(0,1fr)]">
        <SettingsSidebar active={meta.id} />
        <div className="min-w-0" aria-live="polite">
          <ErrorBoundary key={meta.id}>
            <Suspense fallback={<Skeleton className="h-96 rounded-[22px]" />}>
              <Section key={meta.id} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        danger
        title="Discard unsaved changes?"
        message="You have changes in this section that have not been saved. If you leave now they will be lost."
        confirmLabel="Discard and leave"
        cancelLabel="Keep editing"
        onCancel={() => blocker.state === 'blocked' && blocker.reset()}
        onConfirm={() => {
          resetActive()
          if (blocker.state === 'blocked') blocker.proceed()
        }}
      />

      <PatientPreview open={preview} onClose={() => setPreview(false)} />
    </div>
  )
}

/** Shows how the saved clinic profile appears to patients (read-only preview). */
function PatientPreview({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, loading } = useAsync(settingsApi.profile.get)
  return (
    <Modal open={open} onClose={onClose} title="Patient view preview" description="How your saved clinic details appear when patients book." footer={<Button onClick={onClose}>Close</Button>}>
      {loading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="flex items-center gap-4 rounded-[16px] border border-line-2 bg-white p-4 shadow-soft">
          <span className="flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-linear-to-br from-[#0a1d2c] to-[#0f3a4a]">
            {data.logoDataUrl ? <img src={data.logoDataUrl} alt="" className="h-full w-full object-cover" /> : <LogoMark size={40} />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold text-ink">{data.name}</p>
            <p className="text-[13.5px] text-muted">{data.specialties}</p>
            <p className="mt-1 text-[12.5px] text-faint">{data.phone} · {data.email}</p>
            {data.description && <p className="mt-2 text-[13px] text-muted">{data.description}</p>}
          </div>
        </div>
      )}
    </Modal>
  )
}
