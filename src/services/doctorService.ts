import { providersMock } from '@/mocks/providers.mock'
import type { ProvidersData } from '@/types'
import { fromMock, type RequestOptions } from './api/mockTransport'

export const doctorService = {
  get: (opts?: RequestOptions): Promise<ProvidersData> => fromMock(providersMock, 350, opts?.signal),
}
