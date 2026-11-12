import type { ScheduleData, ScheduleRow } from '@/types'

const kumar = { provider: 'Dr. Rajesh Kumar', specialty: 'Cardiology' }
const patel = { provider: 'Dr. Priya Patel', specialty: 'Internal Medicine' }
const chen = { provider: 'Dr. James Chen', specialty: 'Dermatology' }
const garcia = { provider: 'NP Maria Garcia', specialty: 'Family Medicine' }

const rows: ScheduleRow[] = [
  {
    id: 's1', time: '09:00 AM', title: 'John Doe', mrn: 'MRN 10001', subtitle: 'Follow-up Visit · Hypertension', ...kumar,
    type: 'In-Person', status: 'Checked-In', room: 'Room 1',
    details: {
      mrn: 'MRN 10001', complaint: 'Follow-up Visit · Hypertension', insurance: 'Star Health · Active', lastVisit: '14 Apr 2026',
      vitals: [{ label: 'BP', value: '138/86' }, { label: 'HR', value: '78 bpm' }, { label: 'Temp', value: '98.4 °F' }, { label: 'SpO₂', value: '98%' }],
      aiAlert: 'Last BP reading above target — consider medication review.',
    },
  },
  { id: 's2', time: '09:15 AM', title: '(Open Slot)', subtitle: 'Available for same-day booking', ...kumar, type: 'In-Person', status: 'Open Slot', room: 'Room 1', isOpenSlot: true },
  { id: 's3', time: '09:30 AM', title: 'Sarah Johnson', mrn: 'MRN 98765', subtitle: 'Hypertension Follow-up', ...patel, type: 'Video Visit', status: 'Waiting', statusLabel: 'Waiting 4 min', room: '—' },
  { id: 's4', time: '09:45 AM', title: 'Mike Lee', mrn: 'MRN 45678', subtitle: 'Consultation · Persistent cough', ...garcia, type: 'Phone Call', status: 'Confirmed', room: '—' },
  { id: 's5', time: '10:00 AM', title: 'Emily Davis', mrn: 'MRN 54321', subtitle: 'Annual Checkup', ...chen, type: 'In-Person', status: 'In Progress', room: 'Room 2' },
  { id: 's6', time: '10:15 AM', title: '(Open Slot)', subtitle: 'Available for same-day booking', ...chen, type: 'In-Person', status: 'Open Slot', room: 'Room 2', isOpenSlot: true },
  { id: 's7', time: '10:30 AM', title: 'David Wilson', mrn: 'MRN 11223', subtitle: 'Skin Allergy · Rash review', ...chen, type: 'In-Person', status: 'Confirmed', room: 'Room 1' },
  { id: 's8', time: '11:00 AM', title: 'Michael Brown', mrn: 'MRN 33445', subtitle: 'Diabetes Management', ...patel, type: 'In-Person', status: 'Confirmed', room: 'Room 3' },
  { id: 's9', time: '11:30 AM', title: 'Olivia Martinez', mrn: 'MRN 77881', subtitle: 'Post-op Wound Check', ...garcia, type: 'In-Person', status: 'Confirmed', room: 'Room 2' },
]

export const scheduleMock: ScheduleData = {
  stats: [
    { id: 'total', label: 'Total Appointments', value: '36', note: '+12% from yesterday', icon: 'calendar', tone: 'brand' },
    { id: 'wait', label: 'Checked-In / Waiting', value: '4', note: '2 in-person, 2 virtual', icon: 'users', tone: 'brand' },
    { id: 'prog', label: 'In Progress', value: '5', note: '+2 from yesterday', icon: 'pulse', tone: 'brand' },
    { id: 'done', label: 'Completed', value: '12', note: '+8 from yesterday', icon: 'check', tone: 'brand' },
    { id: 'canc', label: 'Cancelled / No-Show', value: '2', note: '+1 from yesterday', icon: 'x', tone: 'brand', trendDown: true },
  ],
  days: [
    { id: 'mon27', label: 'Mon 27', count: 28 },
    { id: 'tue28', label: 'Tue 28', count: 36 },
    { id: 'wed29', label: 'Wed 29', count: 32 },
    { id: 'today', label: 'Today', count: 36 },
    { id: 'fri31', label: 'Fri 31', count: 30 },
    { id: 'sat1', label: 'Sat 1', count: 18 },
    { id: 'sun2', label: 'Sun 2', count: 12 },
  ],
  rows,
  conflict: '1 conflict detected — Room 1 double-booked at 10:30 AM',
  alerts: [
    { id: 'a1', title: 'Dr. Kumar’s wait time is high', body: 'Avg 23 min. Consider reassigning.', action: 'Reassign' },
    { id: 'a2', title: '3 open slots this afternoon', body: 'Promote to fill available slots', action: 'Promote' },
    { id: 'a3', title: 'Mike Lee is high no-show risk', body: 'Missed 2 of last 3 appts.', action: 'Send Reminder' },
    { id: 'a4', title: 'All providers are on schedule', body: 'No bottlenecks detected' },
  ],
  waiting: [
    { id: 'w1', name: 'Sarah Johnson', meta: 'Video · 4 min' },
    { id: 'w2', name: 'John Doe', meta: 'Room 1 · 2 min' },
    { id: 'w3', name: 'Mike Lee', meta: 'Phone · 1 min' },
    { id: 'w4', name: 'Olivia Martinez', meta: 'Lobby · just now' },
  ],
}
