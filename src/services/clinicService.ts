import { clinicMock } from '@/mocks/clinic.mock'
import type { AddLocationInput, ClinicData, ClinicLocation } from '@/types'
import { fromMock, type RequestOptions } from './api/mockTransport'

export const clinicService = {
  get: (opts?: RequestOptions): Promise<ClinicData> => fromMock(clinicMock, 350, opts?.signal),
  addLocation: (input: AddLocationInput): Promise<ClinicLocation> =>
    fromMock<ClinicLocation>({ id: `l-${Date.now()}`, name: input.name, address: input.address, online: false, rooms: '0', providers: '0', hours: 'Not set' }, 400),
  updateLocation: (id: string, input: AddLocationInput): Promise<AddLocationInput & { id: string }> =>
    fromMock({ id, ...input }, 300),
}
