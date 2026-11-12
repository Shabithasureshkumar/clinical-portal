export type UserStatus = 'Online' | 'Running Late' | 'Offline' | 'Invited'
export type UserAccess = 'Admin' | 'Clinician' | 'Staff'

export interface TeamMember {
  id: string
  name: string
  initials: string
  role: string
  email: string
  status: UserStatus
  access: UserAccess
}

export interface UsersData {
  members: TeamMember[]
  totalMembers: number
  pendingInvites: number
  counts: { active: number; invited: number; admins: number; clinicians: number }
}

export interface InviteUserInput {
  name: string
  email: string
  role: string
}
