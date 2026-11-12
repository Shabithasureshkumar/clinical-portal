import { dashboardMock } from '@/mocks/dashboard.mock'
import type { DashboardData } from '@/types'
import { fromMock, type RequestOptions } from './api/mockTransport'

export const dashboardService = {
  get: (opts?: RequestOptions): Promise<DashboardData> => fromMock(dashboardMock, 350, opts?.signal),
}
