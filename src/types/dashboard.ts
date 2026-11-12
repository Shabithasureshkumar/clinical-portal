import type { StatMetric } from './common'

export interface ChartPoint {
  label: string
  [series: string]: string | number
}

export interface TimelineAppointment {
  id: string
  time: string
  meridiem: 'AM' | 'PM'
  patient: string
  provider: string
  dot: 'warn' | 'brand' | 'ok'
  mode: 'Video' | 'In-Person'
  status: 'Waiting' | 'Scheduled' | 'Completed'
  hasPhoto?: boolean
}

export interface TopProvider {
  id: string
  name: string
  specialty: string
  appointments: string
  avgWait: string
  revenue: string
  rating: number
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: 'calendar' | 'userPlus' | 'receipt' | 'chart' | 'message' | 'settings'
}

export interface SecureMessage {
  id: string
  from: string
  time: string
  preview: string
  tag: 'PROVIDER' | 'PATIENT'
}

export interface PatientReview {
  id: string
  author: string
  time: string
  stars: number
  text: string
}

export type DashboardRange = 'Today' | 'This week' | 'This month'

export interface RevenueSeries {
  total: string
  caption: string
  bars: { label: string; value: number }[]
}

export interface DashboardData {
  greetingName: string
  dateLabel: string
  stats: StatMetric[]
  appointmentsChart: ChartPoint[]
  appointmentsByRange: Record<DashboardRange, ChartPoint[]>
  revenueByRange: Record<DashboardRange, RevenueSeries>
  reviews: PatientReview[]
  timeline: TimelineAppointment[]
  topProviders: TopProvider[]
  revenue: { total: string; caption: string; bars: { label: string; value: number }[] }
  quickActions: QuickAction[]
  feedback: {
    score: number
    delta: string
    reviews: number
    distribution: { stars: number; count: number }[]
    latest: PatientReview
  }
  messages: { unread: number; items: SecureMessage[] }
}
