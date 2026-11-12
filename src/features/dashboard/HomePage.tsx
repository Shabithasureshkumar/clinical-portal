import { Download, Plus } from 'lucide-react'
import { useState } from 'react'
import { StatCard } from '@/components/cards/StatCard'
import { Button } from '@/components/common/Button'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState, PageSkeleton } from '@/components/common/States'
import { useToast } from '@/components/common/Toast'
import { AddAppointmentModal } from '@/features/appointments/AddAppointmentModal'
import { useAsync } from '@/hooks/useAsync'
import { dashboardService } from '@/services/dashboardService'
import { downloadFile, toCsv } from '@/utils/download'
import {
  AppointmentsOverview,
  PatientFeedback,
  QuickActions,
  RevenueOverview,
  SecureMessages,
  TodayTimeline,
  TopProvidersTable,
} from './sections'

export default function HomePage() {
  const { data, loading, error, reload } = useAsync(dashboardService.get)
  const notify = useToast()
  const [adding, setAdding] = useState(false)

  if (loading) return <PageSkeleton />
  if (error || !data) return <ErrorState message={error ?? 'Unable to load dashboard'} onRetry={reload} />

  return (
    <div className="space-y-[26px]">
      <PageHeader
        dateLine={data.dateLabel}
        title={
          <>
            Good morning, <span className="text-brand-600">{data.greetingName}</span>
          </>
        }
        subtitle="Here's what's happening across Northstar Clinic today."
        actions={
          <>
            <Button
              icon={<Download size={17} />}
              onClick={() => {
                const rows = data.stats.map((m) => [m.label, m.value, m.delta ?? '', m.caption ?? ''])
                downloadFile('home-overview.csv', toCsv(['Metric', 'Value', 'Change', 'Note'], rows))
                notify('Overview exported as home-overview.csv')
              }}
            >
              Export overview
            </Button>
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => setAdding(true)}>
              Add appointment
            </Button>
          </>
        }
      />

      <div className="grid-stats-6 gap-[26px]">
        {data.stats.map((s) => (
          <StatCard key={s.id} metric={s} variant="icon" />
        ))}
      </div>

      <div className="grid gap-[22px] xl:grid-cols-[1.43fr_1fr]">
        <AppointmentsOverview today={data.appointmentsChart} byRange={data.appointmentsByRange} />
        <TodayTimeline items={data.timeline} />
      </div>

      <div className="grid gap-[18px] xl:grid-cols-[1.55fr_1fr]">
        <TopProvidersTable rows={data.topProviders} />
        <RevenueOverview today={data.revenue} byRange={data.revenueByRange} />
      </div>

      <div className="grid gap-[30px] xl:grid-cols-[2.06fr_1fr_1fr]">
        <QuickActions items={data.quickActions} />
        <PatientFeedback data={data.feedback} reviews={data.reviews} />
        <SecureMessages data={data.messages} />
      </div>
      <AddAppointmentModal
        open={adding}
        providers={data.topProviders.map((p) => p.name)}
        onClose={() => setAdding(false)}
        onSubmit={(v) => notify(`Appointment for ${v.patient} booked at ${v.timeLabel} (demo data, not saved)`)}
      />
    </div>
  )
}
