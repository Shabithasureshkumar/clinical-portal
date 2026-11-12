import type { ClinicData } from '@/types'

export const clinicMock: ClinicData = {
  counts: { locations: 3, rooms: 26, providers: 24, serviceLines: 8 },
  locations: [
    { id: 'l1', name: 'Northbridge Main', address: '1420 Harrow Street, San Francisco, CA', online: true, rooms: '14', providers: '16', hours: '07:00 – 19:00' },
    { id: 'l2', name: 'Westfield Annex', address: '88 Westfield Plaza, Oakland, CA', online: true, rooms: '8', providers: '8', hours: '08:00 – 17:00' },
    { id: 'l3', name: 'Harborview Satellite', address: '12 Harbor Way, Alameda, CA', online: false, rooms: '4', providers: '0', hours: 'Opening Q4 2025' },
  ],
  serviceLines: [
    'Internal Medicine', 'Cardiology', 'Endocrinology', 'Women’s Health',
    'Urgent Care', 'Dermatology', 'Behavioral Health', 'Physical Therapy',
  ],
}
