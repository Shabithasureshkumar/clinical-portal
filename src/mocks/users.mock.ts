import type { UsersData } from '@/types'

export const usersMock: UsersData = {
  totalMembers: 42,
  pendingInvites: 5,
  counts: { active: 37, invited: 5, admins: 4, clinicians: 24 },
  members: [
    { id: 'u1', name: 'Sarah Williams', initials: 'SW', role: 'Chief Medical Officer', email: 's.williams@northbridge.health', status: 'Online', access: 'Admin' },
    { id: 'u2', name: 'Ethan Cole', initials: 'EC', role: 'Cardiologist', email: 'e.cole@northbridge.health', status: 'Running Late', access: 'Clinician' },
    { id: 'u3', name: 'Nina Okafor', initials: 'NO', role: 'Endocrinologist', email: 'n.okafor@northbridge.health', status: 'Online', access: 'Clinician' },
    { id: 'u4', name: 'Lauren Pratt', initials: 'LP', role: 'Nurse Practitioner', email: 'l.pratt@northbridge.health', status: 'Online', access: 'Clinician' },
    { id: 'u5', name: 'Marco Ruiz', initials: 'MR', role: 'Physician Assistant', email: 'm.ruiz@northbridge.health', status: 'Online', access: 'Clinician' },
    { id: 'u6', name: 'Hannah Boyle', initials: 'HB', role: 'Triage Nurse', email: 'h.boyle@northbridge.health', status: 'Offline', access: 'Clinician' },
    { id: 'u7', name: 'Devin Marsh', initials: 'DM', role: 'Billing Specialist', email: 'd.marsh@northbridge.health', status: 'Online', access: 'Staff' },
    { id: 'u8', name: 'Aisha Karim', initials: 'AK', role: 'Front Desk Lead', email: 'a.karim@northbridge.health', status: 'Offline', access: 'Admin' },
  ],
}
