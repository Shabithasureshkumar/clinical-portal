import type { StatMetric } from './common'

export type VisitType = 'In-Person' | 'Video Visit' | 'Phone Call'
export type ScheduleStatus = 'Checked-In' | 'Open Slot' | 'Waiting' | 'Confirmed' | 'In Progress'

export interface ScheduleRow {
  id: string
  time: string
  title: string
  mrn?: string
  subtitle: string
  provider: string
  specialty: string
  type: VisitType
  status: ScheduleStatus
  statusLabel?: string
  room: string
  isOpenSlot?: boolean
  details?: {
    mrn: string
    complaint: string
    insurance: string
    lastVisit: string
    vitals: { label: string; value: string }[]
    aiAlert: string
  }
}

export interface DayTab {
  id: string
  label: string
  count: number
}

export interface ScheduleAlert {
  id: string
  title: string
  body: string
  action?: string
}

export interface WaitingEntry {
  id: string
  name: string
  meta: string
}

export interface ScheduleData {
  stats: StatMetric[]
  days: DayTab[]
  rows: ScheduleRow[]
  alerts: ScheduleAlert[]
  waiting: WaitingEntry[]
  conflict: string
}
