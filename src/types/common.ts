export type Tone = 'brand' | 'ok' | 'warn' | 'bad' | 'info' | 'violet' | 'neutral'

export type StatIconKey =
  | 'users'
  | 'calendar'
  | 'activity'
  | 'coins'
  | 'pulse'
  | 'zap'
  | 'dollar'
  | 'wallet'
  | 'check'
  | 'refresh'
  | 'alert'
  | 'clock'
  | 'star'
  | 'stethoscope'
  | 'play'
  | 'x'

export interface StatMetric {
  id: string
  label: string
  value: string
  /** Delta pill shown top-right on icon-style cards (e.g. "8.2%"). */
  delta?: string
  /** Footnote shown beneath the value. */
  note?: string
  /** Small caption on the line below the value. */
  caption?: string
  icon?: StatIconKey
  tone?: Tone
  trendDown?: boolean
  spark?: number[]
}

export interface SelectOption<T extends string = string> {
  value: T
  label: string
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiErrorShape {
  message: string
  status?: number
  details?: unknown
}
