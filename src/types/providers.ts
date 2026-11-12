import type { StatMetric } from './common'

export type ProviderRole =
  | 'Doctors'
  | 'Nurse Practitioners'
  | 'Physician Assistants'
  | 'Therapists'
  | 'Nurses / MAs'
export type ProviderStatus = 'Online & Available' | 'In a Visit' | 'Offline' | 'Running Late'

export interface ProviderCardData {
  id: string
  name: string
  specialty: string
  credentials: string
  status: ProviderStatus
  role: ProviderRole
  location: string
  today: string
  modes: string
  next: string
  avgWait: string
  rating: string
  waiting: string
  revenue: string
  score: number
  trend: number[]
}

export interface ProviderInsight {
  id: string
  title: string
  body: string
  action: string
  icon: 'alert' | 'sparkle' | 'clock'
  /** Internal route opened by the action button. */
  to?: string
  /** Opens a message dialog to this person instead of navigating. */
  messageTo?: string
}

export interface ProvidersData {
  stats: StatMetric[]
  insights: ProviderInsight[]
  providers: ProviderCardData[]
}
