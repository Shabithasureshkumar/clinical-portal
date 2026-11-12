import { reportsMock } from '@/mocks/reports.mock'
import type { ReportsData } from '@/types'
import { fromMock, type RequestOptions } from './api/mockTransport'

export const reportService = {
  get: (opts?: RequestOptions): Promise<ReportsData> => fromMock(reportsMock, 350, opts?.signal),
}
