import { billingMock } from '@/mocks/billing.mock'
import type { BillingData, Invoice, PageResult } from '@/types'
import { paginate, type ListParams } from './api/listParams'
import { fromMock, type RequestOptions } from './api/mockTransport'

export const billingService = {
  get: (opts?: RequestOptions): Promise<BillingData> => fromMock(billingMock, 350, opts?.signal),

  /** Paginated, filterable invoice list contract (mock adapter). */
  listInvoices: (params: ListParams = {}, opts?: RequestOptions): Promise<PageResult<Invoice>> => {
    const q = params.search?.trim().toLowerCase()
    const filtered = billingMock.invoices.filter((i) => !q || `${i.id} ${i.patient} ${i.provider} ${i.service}`.toLowerCase().includes(q))
    return fromMock(paginate(filtered, params), 250, opts?.signal)
  },
}
