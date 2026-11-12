import { PageHeader } from '@/components/common/PageHeader'
import HelpLegal from '@/features/settings/sections/HelpLegal'

/** Help center available to every signed-in role (the Settings area is admin only). */
export default function HelpPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={['Workspace', 'Support']} title="Help center" subtitle="Support resources, documentation and legal documents." />
      <HelpLegal />
    </div>
  )
}
