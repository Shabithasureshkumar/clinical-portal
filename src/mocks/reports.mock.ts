import type { ReportsData } from '@/types'

export const reportsMock: ReportsData = {
  stats: [
    { id: 'visits', label: 'Patient visits', value: '1,284', note: '12.4% vs. last period' },
    { id: 'rpv', label: 'Revenue per visit', value: '$267.04', note: '8.2% vs. last period' },
    { id: 'wait', label: 'Average wait time', value: '11.8 min', note: '14.1% better' },
    { id: 'sat', label: 'Patient satisfaction', value: '94.2%', note: '4.8% vs. last period' },
    { id: 'noshow', label: 'No-show rate', value: '3.8%', note: '1.2% better' },
    { id: 'denial', label: 'Claim denial rate', value: '2.4%', note: '0.8% better' },
  ],
  summary: {
    headline: 'Northstar Clinic is performing ahead of plan.',
    body: 'Visits are up 12.4% with satisfaction holding at 94.2%. Your strongest opportunity is optimizing Tuesday afternoon capacity and resolving 14 denied claims before month end.',
  },
  operations: [
    { value: 66 },
    { value: 88 },
    { value: 71 },
    { value: 104, emphasis: true },
    { value: 93 },
    { value: 115 },
    { value: 83 },
    { value: 125, emphasis: true },
    { value: 101 },
    { value: 132 },
    { value: 113 },
    { value: 137, emphasis: true },
  ],
  mix: [
    { name: 'Wellness', value: 38, color: '#f5a623' },
    { name: 'Follow-up', value: 27, color: '#5b7cf0' },
    { name: 'Consult', value: 21, color: '#10b981' },
    { name: 'Other', value: 14, color: '#15c8e9' },
  ],
  mixTotal: '1,284',
  quality: [
    { label: 'Care plan completion', value: 96 },
    { label: 'Notes completed on time', value: 91 },
    { label: 'Follow-up adherence', value: 88 },
  ],
  scorecard: [
    { id: 'a', name: 'Dr. Sarah Williams', visits: 96, rating: 4.9, wait: '8 min', completion: '96%', tint: '#d9f6fb' },
    { id: 'b', name: 'Dr. James Chen', visits: 72, rating: 4.8, wait: '18 min', completion: '96%', tint: '#e6e9fb' },
    { id: 'c', name: 'Maya Patel, NP', visits: 112, rating: 4.9, wait: '6 min', completion: '96%', tint: '#dff6ea' },
  ],
  saved: [
    { id: 'r1', title: 'Monthly executive overview', meta: 'Updated 2 hours ago · Sarah Williams', icon: 'doc' },
    { id: 'r2', title: 'Revenue cycle performance', meta: 'Updated yesterday · Finance team', icon: 'chart' },
    { id: 'r3', title: 'Revenue cycle performance', meta: 'Updated yesterday · Finance team', icon: 'chart' },
  ],
}
