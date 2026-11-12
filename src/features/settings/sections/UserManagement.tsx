import { UserPhoto } from '@/components/common/UserPhoto'
import { Pencil, Power, Search, Trash2, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Column } from '@/components/tables/DataTable'
import { useCollection } from '@/hooks/useCollection'
import type { FormErrors } from '@/hooks/useSettingsForm'
import { settingsApi } from '@/services/settingsService'
import type { ClinicUser, ClinicUserStatus, SettingsLocation, Tone, UserRole } from '@/types'
import { isEmail } from '@/utils/validation'
import { SectionState } from '../components/SectionState'
import { SettingsHeader } from '../components/SettingsHeader'
import { ChipSelect, SelectField, TextField } from '../components/SettingsFormField'
import { SettingsModal } from '../components/SettingsModal'
import { SettingsTable } from '../components/SettingsTable'

const ROLES: UserRole[] = ['Clinic administrator', 'Doctor', 'Nurse', 'Receptionist', 'Billing staff']
const STATUS_TONE: Record<ClinicUserStatus, Tone> = { Active: 'ok', Inactive: 'neutral', Invited: 'warn' }
type UserDraft = { name: string; email: string; role: UserRole; locationIds: string[] }

export default function UserManagement() {
  const users = useCollection(settingsApi.users)
  const locations = useCollection(settingsApi.locations)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [inviting, setInviting] = useState(false)
  const [editing, setEditing] = useState<ClinicUser | null>(null)
  const [toRemove, setToRemove] = useState<ClinicUser | null>(null)
  const [toToggle, setToToggle] = useState<ClinicUser | null>(null)

  const items = users.items
  const locName = (id: string) => locations.items.find((l) => l.id === id)?.name ?? 'Unknown'

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((u) => {
      if (role !== 'all' && u.role !== role) return false
      if (status !== 'all' && u.status !== status) return false
      return !q || `${u.name} ${u.email}`.toLowerCase().includes(q)
    })
  }, [items, query, role, status])

  const adminCount = items.filter((u) => u.role === 'Clinic administrator' && u.status === 'Active').length
  const isLastAdmin = (u: ClinicUser) => u.role === 'Clinic administrator' && u.status === 'Active' && adminCount <= 1

  const columns: Column<ClinicUser>[] = [
    {
      key: 'name',
      header: 'User',
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex min-w-0 items-center gap-3">
          <UserPhoto name={r.name} size={38} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-ink">{r.name}</p>
            <p className="truncate text-[12.5px] text-muted">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', sortValue: (r) => r.role, render: (r) => <span className="text-[14px] text-ink-2">{r.role}</span> },
    {
      key: 'locations',
      header: 'Assigned location',
      render: (r) => <span className="text-[13.5px] text-muted">{r.locationIds.length === 0 ? 'None' : r.locationIds.length > 2 ? `${locName(r.locationIds[0] ?? '')} +${r.locationIds.length - 1}` : r.locationIds.map(locName).join(', ')}</span>,
    },
    { key: 'status', header: 'Status', sortValue: (r) => r.status, render: (r) => <Badge tone={STATUS_TONE[r.status]} dot size="sm">{r.status}</Badge> },
    { key: 'last', header: 'Last active', render: (r) => <span className="text-[13.5px] text-muted">{r.lastActive}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex gap-1.5">
          <button type="button" aria-label={`Edit ${r.name}`} onClick={() => setEditing(r)} className="rounded-[8px] border border-line p-2 text-ink-2 hover:bg-tint"><Pencil size={14} /></button>
          {r.status !== 'Invited' && (
            <button type="button" aria-label={`${r.status === 'Active' ? 'Deactivate' : 'Activate'} ${r.name}`} onClick={() => setToToggle(r)} className="rounded-[8px] border border-line p-2 text-ink-2 hover:bg-tint"><Power size={14} /></button>
          )}
          <button type="button" aria-label={`Remove ${r.name}`} onClick={() => setToRemove(r)} className="rounded-[8px] border border-line p-2 text-bad hover:bg-[#fff1f1]"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <SectionState loading={users.loading || locations.loading} error={users.error ?? locations.error} onRetry={users.reload}>
      <div className="space-y-5">
        <SettingsHeader
          title="User management"
          description="Staff accounts, roles and location access"
          actions={<Button variant="primary" icon={<UserPlus size={16} />} onClick={() => setInviting(true)}>Invite user</Button>}
          stats={[
            { label: 'Total users', value: items.length },
            { label: 'Active users', value: items.filter((u) => u.status === 'Active').length, tone: 'ok' },
            { label: 'Pending invitations', value: items.filter((u) => u.status === 'Invited').length, tone: 'warn' },
            { label: 'Inactive', value: items.filter((u) => u.status === 'Inactive').length },
          ]}
        />

        <SettingsTable
          toolbar={
            <>
              <label className="flex h-[48px] min-w-[220px] flex-1 items-center gap-3 rounded-[12px] border border-line bg-white px-4 sm:max-w-[340px]">
                <Search size={15} className="text-ink-2" />
                <span className="sr-only">Search users</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" className="h-full flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-muted" />
              </label>
              <div className="w-[200px]">
                <SelectField label="" aria-label="Filter by role" options={[{ value: 'all', label: 'All roles' }, ...ROLES.map((r) => ({ value: r, label: r }))]} value={role} onChange={setRole} wrapperClassName="[&>label]:hidden" />
              </div>
              <div className="w-[170px]">
                <SelectField label="" aria-label="Filter by status" options={[{ value: 'all', label: 'All statuses' }, { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'Invited', label: 'Invited' }]} value={status} onChange={setStatus} wrapperClassName="[&>label]:hidden" />
              </div>
            </>
          }
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          template="grid-cols-[2fr_1.3fr_1.4fr_1fr_1fr_130px]"
          minWidth={1000}
          emptyTitle="No users found"
          emptyDescription="Invite a team member or clear your filters."
        />

        <UserModal
          key={editing?.id ?? (inviting ? 'new' : 'closed')}
          open={inviting || editing !== null}
          initial={editing}
          locations={locations.items}
          existingEmails={items.filter((u) => u.id !== editing?.id).map((u) => u.email.toLowerCase())}
          lockRole={editing ? isLastAdmin(editing) : false}
          onClose={() => { setInviting(false); setEditing(null) }}
          onSubmit={async (v) => {
            if (editing) await users.update({ ...editing, ...v }, `${v.name} updated`)
            else await users.create({ ...v, status: 'Invited', lastActive: 'Never' }, `Invitation sent to ${v.email} (demo, no email is sent)`)
            setInviting(false)
            setEditing(null)
          }}
        />

        <ConfirmDialog
          open={toToggle !== null}
          danger={toToggle?.status === 'Active'}
          title={toToggle?.status === 'Active' ? 'Deactivate user?' : 'Activate user?'}
          message={
            toToggle && toToggle.status === 'Active' && isLastAdmin(toToggle)
              ? 'This is the only active clinic administrator. Assign another administrator first.'
              : toToggle?.status === 'Active'
                ? `${toToggle.name} will lose access immediately. You can reactivate the account later.`
                : `${toToggle?.name ?? 'This user'} will regain access to the portal.`
          }
          confirmLabel={toToggle?.status === 'Active' ? 'Deactivate' : 'Activate'}
          onCancel={() => setToToggle(null)}
          onConfirm={async () => {
            if (toToggle && !(toToggle.status === 'Active' && isLastAdmin(toToggle))) {
              const next: ClinicUserStatus = toToggle.status === 'Active' ? 'Inactive' : 'Active'
              await users.update({ ...toToggle, status: next }, `${toToggle.name} ${next === 'Active' ? 'activated' : 'deactivated'}`)
            }
            setToToggle(null)
          }}
        />

        <ConfirmDialog
          open={toRemove !== null}
          danger
          title="Remove user?"
          message={toRemove && isLastAdmin(toRemove) ? 'This is the only active clinic administrator and cannot be removed.' : `${toRemove?.name ?? 'This user'} will be removed from the clinic. This cannot be undone.`}
          confirmLabel="Remove user"
          onCancel={() => setToRemove(null)}
          onConfirm={async () => {
            if (toRemove && !isLastAdmin(toRemove)) await users.remove(toRemove.id, `${toRemove.name} removed`)
            setToRemove(null)
          }}
        />
      </div>
    </SectionState>
  )
}

interface UserModalProps {
  open: boolean
  initial: ClinicUser | null
  locations: SettingsLocation[]
  existingEmails: string[]
  lockRole: boolean
  onClose: () => void
  onSubmit: (v: UserDraft) => Promise<void>
}

function UserModal({ open, initial, locations, existingEmails, lockRole, onClose, onSubmit }: UserModalProps) {
  const [v, setV] = useState<UserDraft>({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    role: initial?.role ?? 'Receptionist',
    locationIds: initial?.locationIds ?? [],
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const e: FormErrors = {}
    if (v.name.trim().length < 2) e.name = 'Full name is required'
    if (!isEmail(v.email)) e.email = 'Enter a valid email address'
    else if (existingEmails.includes(v.email.trim().toLowerCase())) e.email = 'A user with this email already exists'
    if (v.locationIds.length === 0) e.locationIds = 'Assign at least one location'
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    await onSubmit({ ...v, name: v.name.trim(), email: v.email.trim() })
    setBusy(false)
  }

  return (
    <SettingsModal open={open} title={initial ? 'Edit user' : 'Invite user'} description={initial ? 'Change role and location access.' : 'They will receive an invitation to join the clinic.'} submitLabel={initial ? 'Save changes' : 'Send invitation'} busy={busy} onClose={onClose} onSubmit={submit}>
      <TextField label="Full name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={errors.name} />
      <TextField label="Email" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} error={errors.email} />
      <SelectField label="Role" options={ROLES} value={v.role} onChange={(r) => setV({ ...v, role: r as UserRole })} disabled={lockRole} hint={lockRole ? 'The only active administrator cannot change role' : undefined} />
      <ChipSelect label="Assigned locations" options={locations.map((l) => ({ value: l.id, label: l.name }))} selected={v.locationIds} onChange={(ids) => setV({ ...v, locationIds: ids })} error={errors.locationIds} />
    </SettingsModal>
  )
}
