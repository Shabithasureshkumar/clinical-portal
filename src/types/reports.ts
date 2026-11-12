import type { StatMetric } from './common'

export interface ProviderScore {
  id: string
  name: string
  visits: number
  rating: number
  wait: string
  completion: string
  tint: string
}

export interface SavedReport {
  id: string
  title: string
  meta: string
  icon: 'doc' | 'chart'
}

export interface ReportsData {
  stats: StatMetric[]
  summary: { headline: string; body: string }
  operations: { value: number; emphasis?: boolean }[]
  mix: { name: string; value: number; color: string }[]
  mixTotal: string
  quality: { label: string; value: number }[]
  scorecard: ProviderScore[]
  saved: SavedReport[]
}
