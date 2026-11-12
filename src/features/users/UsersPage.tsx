import { useSyncedState } from '@/hooks/useSyncedState'
import { UserPhoto } from '@/components/common/UserPhoto'
import { ShieldCheck, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Controller } from 'react-hook-form'
import { z } from 'zod'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Dropdown } from '@/components/common/Dropdown'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { SearchInput } from '@/components/common/SearchInput'
import { ErrorState, PageSkeleton } from '@/components/common/States'
import { useToast } from '@/components/common/Toast'
import { TextField } from '@/components/forms/Fields'
import { FormDialog } from '@/components/forms/FormDialog'
import { SelectField } from '@/components/forms/SelectFields'
import { ROUTE_ROLES } from '@/constants/permissions'
import { ROUTES } from '@/constants/routes'
import { useZodForm } from '@/hooks/useZodForm'
import { inviteSchema } from '@/schemas/common'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { useAsync } from '@/hooks/useAsync'
import { userService } from '@/services/userService'
import type { TeamMember, Tone, UserStatus } from '@/types'
import { TONES } from '@/utils/tones'
import { cn } from '@/utils/cn'

const PAGE_SIZE = 8
const ROLES = ['Chief Medical Officer', 'Cardiologist', 'Endocrinologist', 'Nurse Practitioner', 'Physician Assistant', 'Triage Nurse', 'Billing Specialist', 'Front Desk Lead']
const STATUS_TONE: Record<UserStatus, Tone> = { Online: 'ok', 'Running Late': 'warn', Offline: 'neutral', Invited: 'info' }

type Filter = 'all' | 'active' | 'invited' | 'admins' | 'clinicians'

export default function UsersPage() {
  const { data, loading, error, reload } = useAsync(userService.get)
  const notify = useToast()
  const [members, setMembers] = useSyncedState<TeamMember[]>(data, () => data?.members ?? [])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useSyncedState(`${query}|${filter}`, () => 1)
  const [invite, setInvite] = useState(false)
  const [rolesOpen, setRolesOpen] = useState(false)
  const [managing, setManaging] = useState<TeamMember | null>(null)


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members.filter((m) => {
      if (filter === 'active' && (m.status === 'Offline' || m.status === 'Invited')) return false
      if (filter === 'invited' && m.status !== 'Invited') return false
      if (filter === 'admins' && m.access !== 'Admin') return false
      if (filter === 'clinicians' && m.access !== 'Clinician') return false
      return !q || [m.name, m.email, m.role].some((v) => v.toLowerCase().includes(q))
    })
  }, [members, query, filter])

  if (loading) return <PageSkeleton cards={4} />
  if (error || !data) return <ErrorState message={error ?? 'Unable to load users'} onRetry={reload} />

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const invitedAdded = members.filter((m) => m.status === 'Invited').length

  const chips: { id: Filter; label: string; count: number; tone: Tone }[] = [
    { id: 'active', label: 'Active', count: data.counts.active, tone: 'ok' },
    { id: 'invited', label: 'Invited', count: data.counts.invited + invitedAdded, tone: 'warn' },
    { id: 'admins', label: 'Admins', count: data.counts.admins, tone: 'brand' },
    { id: 'clinicians', label: 'Clinicians', count: data.counts.clinicians, tone: 'brand' },
  ]

  const columns: Column<TeamMember>[] = [
    {
      key: 'member',
      header: 'Member',
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-4">
          <UserPhoto name={r.name} size={42} />
          <span className="text-[16px] font-semibold text-ink">{r.name}</span>
        </div>
      ),
    },
    { key: 'role', header: 'Role', sortValue: (r) => r.role, render: (r) => <span className="text-[16px] text-muted">{r.role}</span> },
    { key: 'email', header: 'Email', sortValue: (r) => r.email, render: (r) => <span className="truncate text-[15.8px] text-muted">{r.email}</span> },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.status,
      render: (r) => (
        <Badge tone={STATUS_TONE[r.status]} dot className="!px-3.5 !py-[4px] !text-[13.5px]">
          {r.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      className: 'pr-[18px]',
      render: (r) => (
        <button type="button" onClick={() => setManaging(r)} className="text-[15px] font-semibold text-brand-600 hover:underline" aria-label={`Manage ${r.name}`}>
          Manage
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-[38px]">
      <Card className="rounded-[26px] p-[27px] pb-[28px]">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="text-[27.5px] font-bold leading-tight tracking-[-0.025em] text-ink">User Management</h1>
            <p className="mt-2 text-[16.3px] text-muted">
              {data.totalMembers + (members.length - data.members.length)} team members · {data.pendingInvites + invitedAdded} pending invites
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-4 lg:w-auto">
            <div className="h-[54px] w-full rounded-[14px] border border-brand-100 bg-brand-50/70 sm:w-[275px]">
              <SearchInput bare value={query} onChange={setQuery} placeholder="Search users" label="Search users" className="h-full" />
            </div>
            <Button size="lg" className="!h-[52px] !text-[16.1px]" icon={<ShieldCheck size={17} />} onClick={() => setRolesOpen(true)}>
              Roles &amp; Permissions
            </Button>
            <Button size="lg" variant="primary" className="!h-[52px] !text-[16.1px]" icon={<UserPlus size={18} />} onClick={() => setInvite(true)}>
              Invite User
            </Button>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          {chips.map((c) => {
            const t = TONES[c.tone]
            const active = filter === c.id
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(active ? 'all' : c.id)}
                className={cn('flex h-[50px] items-center gap-3 rounded-[14px] border px-5 text-[17px] transition', active && 'ring-2 ring-brand-300')}
                style={{ background: c.tone === 'brand' ? '#e6f8fc' : t.bg, borderColor: t.border }}
              >
                <span className="text-muted">{c.label}</span>
                <span className="font-bold" style={{ color: t.text }}>{c.count}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="rounded-[26px] p-[27px] pb-[28px]">
        <h2 className="text-[18px] font-bold tracking-[-0.01em] text-ink">Team Directory</h2>
        <p className="mt-2.5 text-[16px] text-muted">All clinic accounts</p>
        <div className="mt-[26px] overflow-hidden rounded-[20px] border border-line-2">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            minWidth={900}
            emptyTitle="No team members found"
            emptyDescription="Try a different search or clear the active filter."
            headerClassName="grid-cols-[340px_330px_441px_1fr_90px] bg-brand-50/60 px-[24px] py-[18px] text-[13.4px] font-bold uppercase tracking-[0.04em] text-ink-2"
            rowClassName="grid-cols-[340px_330px_441px_1fr_90px] border-t border-line-2 px-[24px] py-[18px]"
          />
        </div>
        <Pagination page={page} pageCount={pageCount} onChange={setPage} className="mt-5" />
      </Card>

      <RolesDialog open={rolesOpen} onClose={() => setRolesOpen(false)} />
      <InviteModal
        open={invite}
        onClose={() => setInvite(false)}
        onInvite={async (input) => {
          const created = await userService.invite(input)
          setMembers((prev) => [...prev, created])
          notify(`Invitation sent to ${input.email}`)
          setInvite(false)
        }}
      />

      <ManageModal
        member={managing}
        onClose={() => setManaging(null)}
        onSave={(id, role) => {
          setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)))
          notify('Role updated')
          setManaging(null)
        }}
        onRemove={(id) => {
          setMembers((prev) => prev.filter((m) => m.id !== id))
          notify('Member removed')
          setManaging(null)
        }}
      />
    </div>
  )
}

function InviteModal({ open, onClose, onInvite }: { open: boolean; onClose: () => void; onInvite: (v: { name: string; email: string; role: string }) => Promise<void> }) {
  const inviteWithRole = inviteSchema.extend({ role: z.string().min(1) })
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useZodForm(inviteWithRole, { defaultValues: { name: '', email: '', role: ROLES[6] ?? '' } })
  const submit = handleSubmit(async (v) => {
    await onInvite({ name: v.name, email: v.email, role: v.role })
    reset()
  })
  return (
    <FormDialog open={open} title="Invite user" description="They'll receive an email to join Northstar Clinic (demo: no email is sent)." submitLabel="Send invite" busy={isSubmitting} onClose={onClose} onSubmit={submit}>
      <TextField label="Full name" placeholder="Jane Doe" error={errors.name?.message} {...register('name')} />
      <TextField label="Email" type="email" placeholder="jane@northbridge.health" error={errors.email?.message} {...register('email')} />
      <Controller control={control} name="role" render={({ field }) => <SelectField label="Role" options={ROLES} value={field.value} onChange={field.onChange} />} />
    </FormDialog>
  )
}

const ROLE_DETAILS: { role: string; description: string }[] = [
  { role: 'Clinic administrator', description: 'Manages settings, users, billing and all clinic data.' },
  { role: 'Doctor', description: 'Clinical work, schedules and reports.' },
  { role: 'Nurse', description: 'Clinical support and patient flow.' },
  { role: 'Receptionist', description: 'Scheduling and front desk tasks.' },
  { role: 'Billing staff', description: 'Invoices, claims and revenue.' },
]

const AREAS: { label: string; route: string }[] = [
  { label: 'Billing & Revenue', route: ROUTES.billing },
  { label: 'Reports & Analytics', route: ROUTES.reports },
  { label: 'User Management', route: ROUTES.users },
  { label: 'Clinic Management', route: ROUTES.clinic },
  { label: 'Settings', route: ROUTES.settings },
]

function RolesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Roles & permissions" description="Which areas each role can open in this portal. The backend must enforce the same rules." size="lg" footer={<Button onClick={onClose}>Close</Button>}>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="text-[12.5px] font-bold uppercase tracking-[0.05em] text-ink-2">
              <th scope="col" className="pb-3 pr-4">Role</th>
              {AREAS.map((a) => (
                <th key={a.route} scope="col" className="pb-3 text-center">{a.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLE_DETAILS.map((r) => (
              <tr key={r.role} className="border-t border-line-2">
                <th scope="row" className="py-3 pr-4 text-left font-normal">
                  <span className="block font-semibold text-ink">{r.role}</span>
                  <span className="block text-[12.5px] text-muted">{r.description}</span>
                </th>
                {AREAS.map((a) => {
                  const allowed = ROUTE_ROLES[a.route]?.includes(r.role as never) ?? true
                  return (
                    <td key={a.route} className="text-center">
                      <span className={allowed ? 'text-ok' : 'text-muted'} aria-label={allowed ? 'Allowed' : 'Not allowed'}>{allowed ? '✓' : '—'}</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}

function ManageModal({ member, onClose, onSave, onRemove }: { member: TeamMember | null; onClose: () => void; onSave: (id: string, role: string) => void; onRemove: (id: string) => void }) {
  const [role, setRole] = useSyncedState(member, () => member?.role ?? '')
  if (!member) return null
  return (
    <Modal
      open
      onClose={onClose}
      title={`Manage ${member.name}`}
      description={member.email}
      footer={
        <>
          <Button variant="danger" className="mr-auto" onClick={() => onRemove(member.id)}>
            Remove member
          </Button>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(member.id, role)}>
            Save changes
          </Button>
        </>
      }
    >
      <span className="mb-3 block text-[14.5px] font-semibold text-ink">Role</span>
      <Dropdown variant="field" label="Role" value={role} onChange={setRole} options={[...new Set([member.role, ...ROLES])].map((r) => ({ value: r, label: r }))} />
    </Modal>
  )
}
