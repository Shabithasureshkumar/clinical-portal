import type { BillingData } from '@/types'

const spark = [3, 5, 4, 7, 8, 9, 11]

const daily = [
  ['Mon', 30], ['', 40], ['Tue', 46], ['', 42], ['Wed', 39], ['', 50], ['Thu', 54], ['', 48],
  ['Fri', 58], ['', 64], ['Sat', 60], ['', 66], ['Sun', 72],
] as const

export const billingMock: BillingData = {
  stats: [
    { id: 'total', label: 'Total revenue', value: '$342,840', delta: '18.4%', caption: 'vs. previous period', icon: 'dollar', tone: 'brand', spark },
    { id: 'out', label: 'Outstanding balance', value: '$28,460', delta: '6.2%', caption: '$4,200 overdue', icon: 'wallet', tone: 'warn', spark },
    { id: 'col', label: 'Collected revenue', value: '$286,920', delta: '22.1%', caption: '83.7% collection rate', icon: 'check', tone: 'ok', spark },
    { id: 'ins', label: 'Insurance pending', value: '$18,240', delta: '4.8%', caption: '42 claims in review', icon: 'refresh', tone: 'info', spark },
    { id: 'den', label: 'Denied claims', value: '14', delta: '2.4%', caption: 'Down from 19', icon: 'alert', tone: 'bad', spark },
    { id: 'avg', label: 'Avg. reimbursement', value: '18.4 days', delta: '3.1 days', caption: 'Faster than benchmark', icon: 'pulse', tone: 'violet', spark },
  ],
  total: '$342,840',
  delta: '18.4% vs. previous period',
  series: {
    Daily: daily.map(([label, value]) => ({ label, value })),
    Weekly: [28, 33, 31, 40, 44, 52, 58].map((v, i) => ({ label: `W${i + 1}`, value: v })),
    Monthly: [22, 30, 36, 34, 48, 55, 70].map((v, i) => ({ label: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][i] ?? '', value: v })),
  },
  providers: [
    { id: 'p1', name: 'Dr. Sarah Williams', visits: 84, revenue: 84240, tint: '#dff7fb' },
    { id: 'p2', name: 'Dr. James Chen', visits: 68, revenue: 68920, tint: '#e9ebfb' },
    { id: 'p3', name: 'Dr. Sarah Williams', visits: 84, revenue: 84240, tint: '#dff7fb' },
    { id: 'p4', name: 'Maya Patel, NP', visits: 52, revenue: 52480, tint: '#e0f6ec' },
    { id: 'p5', name: 'Dr. Sarah Williams', visits: 84, revenue: 84240, tint: '#dff7fb' },
  ],
  tabCounts: { Invoices: 128, Claims: 42, Payments: 86 },
  invoices: [
    { id: 'INV-20482', patient: 'Amelia Wilson', provider: 'Dr. Williams', service: 'Wellness visit', balance: 240, status: 'Paid' },
    { id: 'INV-20481', patient: 'Noah Martinez', provider: 'Dr. Chen', service: 'Cardiology consult', balance: 180, status: 'Insurance pending' },
    { id: 'INV-20480', patient: 'Olivia Thompson', provider: 'Maya Patel, NP', service: 'Follow-up visit', balance: 95, status: 'Sent' },
    { id: 'INV-20479', patient: 'Ethan Brown', provider: 'Dr. Williams', service: 'Lab review', balance: 120, status: 'Overdue' },
    { id: 'INV-20478', patient: 'Sophia Lee', provider: 'Dr. Chen', service: 'Dermatology consult', balance: 210, status: 'Paid' },
    { id: 'INV-20477', patient: 'Liam Carter', provider: 'Dr. Williams', service: 'Annual physical', balance: 320, status: 'Sent' },
    { id: 'INV-20476', patient: 'Isabella Reed', provider: 'Maya Patel, NP', service: 'Vaccination', balance: 60, status: 'Paid' },
    { id: 'INV-20475', patient: 'Mason Clark', provider: 'Dr. Chen', service: 'Cardiology follow-up', balance: 150, status: 'Insurance pending' },
  ],
}
