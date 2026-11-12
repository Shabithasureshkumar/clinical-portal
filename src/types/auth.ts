export type AuthRole = 'Clinic administrator' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Billing staff'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: AuthRole
}

export interface LoginRequest {
  email: string
  password: string
  /** Demo only: lets the mock adapter simulate different roles. A real backend decides the role. */
  demoRole?: AuthRole
}

export interface Session {
  user: AuthUser
  accessToken: string
  /** ISO timestamp. */
  expiresAt: string
}

export interface AppNotification {
  id: string
  title: string
  body: string
  time: string
  read: boolean
  to: string
  kind: 'alert' | 'info' | 'billing' | 'message'
}
