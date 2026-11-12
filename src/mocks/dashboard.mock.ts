import type { DashboardData } from '@/types'

const rising = [3, 5, 4, 7, 8, 9, 11]

const week = (vals: number[][]) =>
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({ label, total: vals[i]?.[0] ?? 0, completed: vals[i]?.[1] ?? 0, progress: vals[i]?.[2] ?? 0 }))

const month = (vals: number[][]) =>
  ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((label, i) => ({ label, total: vals[i]?.[0] ?? 0, completed: vals[i]?.[1] ?? 0, progress: vals[i]?.[2] ?? 0 }))

export const dashboardMock: DashboardData = {
  greetingName: 'Dr. Sarah',
  dateLabel: 'TUESDAY, OCTOBER 24, 2024',
  stats: [
    { id: 'patients', label: 'Total patients', value: '2,840', delta: '8.2%', caption: 'vs. last month', icon: 'users', tone: 'brand', spark: rising },
    { id: 'appts', label: "Today's appointments", value: '48', delta: '12.5%', caption: '6 more than usual', icon: 'calendar', tone: 'info', spark: rising },
    { id: 'online', label: 'Providers online', value: '8 / 10', delta: '2 active', caption: 'All systems normal', icon: 'activity', tone: 'ok', spark: rising },
    { id: 'revenue', label: 'Revenue today', value: '$18,426', delta: '14.8%', caption: 'vs. last Tuesday', icon: 'coins', tone: 'warn', spark: rising },
    { id: 'waiting', label: 'Waiting patients', value: '06', delta: '4.2 min', caption: 'Average wait time', icon: 'pulse', tone: 'bad', spark: [9, 8, 9, 7, 6, 5, 4] },
    { id: 'slots', label: 'Open slots', value: '12', delta: '3 urgent', caption: 'Available today', icon: 'zap', tone: 'violet', spark: rising },
  ],
  appointmentsChart: [
    { label: '6 AM', total: 4, completed: 2, progress: 0 },
    { label: '8 AM', total: 11, completed: 5, progress: 2 },
    { label: '9 AM', total: 17.8, completed: 9, progress: 4 },
    { label: '10 AM', total: 23.7, completed: 13, progress: 5 },
    { label: '12 PM', total: 26.6, completed: 17, progress: 5.5 },
    { label: '2 PM', total: 29.5, completed: 21, progress: 4.4 },
    { label: '3 PM', total: 32.5, completed: 25, progress: 5 },
    { label: '5 PM', total: 33.5, completed: 28, progress: 3.5 },
    { label: '6 PM', total: 34.6, completed: 31, progress: 1.8 },
    { label: '9 PM', total: 36, completed: 33, progress: 0.8 },
  ],
  appointmentsByRange: {
    Today: [],
    'This week': week([[128, 120, 8], [142, 133, 9], [135, 127, 8], [150, 138, 12], [161, 148, 13], [74, 70, 4], [40, 38, 2]]),
    'This month': month([[620, 590, 30], [655, 630, 25], [640, 612, 28], [690, 640, 50]]),
  },
  revenueByRange: {
    Today: { total: '', caption: '', bars: [] },
    'This week': {
      total: '₹58,320',
      caption: 'Total revenue · +9% from last week',
      bars: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({ label, value: [8200, 9100, 8600, 9900, 10400, 6900, 5220][i] ?? 0 })),
    },
    'This month': {
      total: '₹2,41,780',
      caption: 'Total revenue · +6% from last month',
      bars: ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((label, i) => ({ label, value: [58200, 61400, 59800, 62380][i] ?? 0 })),
    },
  },
  reviews: [
    { id: 'r1', author: 'Sarah J.', time: '2h ago', stars: 5, text: 'Dr. Kumar was very thorough and kind. Best visit I\u2019ve had.' },
    { id: 'r2', author: 'Daniel P.', time: '5h ago', stars: 5, text: 'Quick check-in and a clear explanation of my results.' },
    { id: 'r3', author: 'Meera S.', time: 'Yesterday', stars: 4, text: 'Great care, though the wait was a little long.' },
    { id: 'r4', author: 'Alex T.', time: '2 days ago', stars: 3, text: 'Helpful staff. Parking could be easier.' },
  ],
  timeline: [
    { id: 't1', time: '10:30', meridiem: 'AM', patient: 'Sarah Johnson', provider: 'Dr. Kumar', dot: 'warn', mode: 'Video', status: 'Waiting' },
    { id: 't2', time: '10:45', meridiem: 'AM', patient: 'Mike Lee', provider: 'Dr. Chen', dot: 'brand', mode: 'In-Person', status: 'Scheduled' },
    { id: 't3', time: '12:00', meridiem: 'PM', patient: 'Tom Wright', provider: 'Dr. Chen', dot: 'brand', mode: 'Video', status: 'Scheduled', hasPhoto: true },
    { id: 't4', time: '12:15', meridiem: 'PM', patient: 'Nina Costa', provider: 'NP Garcia', dot: 'ok', mode: 'In-Person', status: 'Completed' },
  ],
  topProviders: [
    { id: 'p1', name: 'Dr. Rajesh Kumar', specialty: 'Cardiology', appointments: '8 appts (2 video)', avgWait: '7 min', revenue: '₹24,560', rating: 4.9 },
    { id: 'p2', name: 'Dr. Priya Patel', specialty: 'Internal Medicine', appointments: '7 appts (1 video)', avgWait: '6 min', revenue: '₹19,240', rating: 4.8 },
    { id: 'p3', name: 'NP Maria Garcia', specialty: 'Family Medicine', appointments: '5 appts (2 video)', avgWait: '5 min', revenue: '₹11,980', rating: 4.2 },
    { id: 'p4', name: 'Dr. James Chen', specialty: 'Dermatology', appointments: '5 appts (1 video)', avgWait: '4 min', revenue: '₹16,320', rating: 4.8 },
  ],
  revenue: {
    total: '₹8,940',
    caption: 'Total revenue · +18% from yesterday',
    bars: [
      { label: '6 AM', value: 220 }, { label: '', value: 450 }, { label: '9 AM', value: 640 }, { label: '', value: 950 },
      { label: '', value: 1260 }, { label: '12 PM', value: 880 }, { label: '', value: 1140 }, { label: '', value: 740 },
      { label: '3 PM', value: 1330 }, { label: '', value: 1180 }, { label: '', value: 810 }, { label: '6 PM', value: 980 },
      { label: '', value: 590 }, { label: '', value: 380 }, { label: '', value: 200 },
    ],
  },
  quickActions: [
    { id: 'q1', title: 'Manage Schedules', description: 'Bulk slots & provider edits', icon: 'calendar' },
    { id: 'q2', title: 'Invite Team Member', description: 'Add providers & staff', icon: 'userPlus' },
    { id: 'q3', title: 'Review Unpaid Invoices', description: '12 invoices · $4,820', icon: 'receipt' },
    { id: 'q4', title: 'Generate Reports', description: 'Daily & weekly summaries', icon: 'chart' },
    { id: 'q5', title: 'Clinic Announcement', description: 'Message all providers', icon: 'message' },
    { id: 'q6', title: 'Clinic Settings', description: 'Locations, services, integrations', icon: 'settings' },
  ],
  feedback: {
    score: 4.8,
    delta: '+0.2',
    reviews: 22,
    distribution: [
      { stars: 5, count: 18 },
      { stars: 4, count: 3 },
      { stars: 3, count: 1 },
    ],
    latest: {
      id: 'r1',
      author: 'Sarah J.',
      time: '2h ago',
      stars: 5,
      text: 'Dr. Kumar was very thorough and kind. Best visit I’ve had.',
    },
  },
  messages: {
    unread: 3,
    items: [
      { id: 'm1', from: 'Dr. Kumar', time: '10 min ago', preview: 'Can we adjust my Friday schedule? I have a conference', tag: 'PROVIDER' },
      { id: 'm2', from: 'Robert K.', time: '2 hours ago', preview: 'Is it possible to get my lab results sent over?', tag: 'PATIENT' },
    ],
  },
}
