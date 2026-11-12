import type { StatMetric } from './common'

export type InvoiceStatus = 'Paid' | 'Insurance pending' | 'Sent' | 'Overdue'
export type BillingTab = 'Invoices' | 'Claims' | 'Payments' | 'All transactions'
export type RevenueRange = 'Daily' | 'Weekly' | 'Monthly'

export interface Invoice {
  id: string
  patient: string
  provider: string
  service: string
  balance: number
  status: InvoiceStatus
}

export interface RevenueProvider {
  id: string
  name: string
  visits: number
  revenue: number
  tint: string
}

export interface BillingData {
  stats: StatMetric[]
  total: string
  delta: string
  series: Record<RevenueRange, { label: string; value: number }[]>
  providers: RevenueProvider[]
  invoices: Invoice[]
  tabCounts: { Invoices: number; Claims: number; Payments: number }
}
