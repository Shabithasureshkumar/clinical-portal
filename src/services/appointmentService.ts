import { scheduleMock } from '@/mocks/schedule.mock'
import type { ScheduleData } from '@/types'
import { fromMock, type RequestOptions } from './api/mockTransport'

export const appointmentService = {
  get: (opts?: RequestOptions): Promise<ScheduleData> => fromMock(scheduleMock, 350, opts?.signal),
}
