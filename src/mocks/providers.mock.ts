import type { ProvidersData } from '@/types'

export const providersMock: ProvidersData = {
  stats: [
    { id: 'online', label: 'Online & Available', value: '3', note: '+1 vs last hour', icon: 'check', tone: 'brand' },
    { id: 'visit', label: 'In a Visit', value: '2', note: 'avg 18 min elapsed', caption: 'plain', icon: 'users', tone: 'brand' },
    { id: 'off', label: 'Offline', value: '1', note: 'Kevin Brown', icon: 'alert', tone: 'brand', trendDown: true, caption: 'plain' },
    { id: 'late', label: 'Running Late', value: '1', note: '+15 min behind', icon: 'clock', tone: 'brand', trendDown: true },
    { id: 'appts', label: 'Total Appts Today', value: '36', note: '+12% from yesterday', icon: 'calendar', tone: 'brand' },
    { id: 'rating', label: 'Clinic Avg. Rating', value: '4.8', note: '+0.2 this month', icon: 'star', tone: 'brand' },
  ],
  insights: [
    { id: 'i1', title: 'Dr. Kumar’s avg wait time', body: 'Increased to 22 min today.', action: 'Reassign', icon: 'alert', to: '/clinic-schedule?provider=Dr.%20Rajesh%20Kumar' },
    { id: 'i2', title: 'Dr. Chen has 3 open', body: 'afternoon slots.', action: 'Promote Slots', icon: 'sparkle', to: '/clinic-schedule?status=Open%20Slot' },
    { id: 'i3', title: 'NP Garcia has a 4.2 rating', body: 'this month, down from 4.7.', action: 'View Feedback', icon: 'alert', to: '/reports-analytics' },
    { id: 'i4', title: 'Dr. Patel has 2 incomplete', body: 'SOAP notes from yesterday.', action: 'Send Reminder', icon: 'clock', messageTo: 'Dr. Priya Patel' },
  ],
  providers: [
    {
      id: 'kumar', name: 'Dr. Rajesh Kumar', specialty: 'Cardiology', credentials: 'MD, DM (Cardiology)', status: 'Online & Available', role: 'Doctors',
      location: 'Northbridge Main', today: 'Today: 8 appts', modes: '2 video, 6 in-person', next: 'Next: 10:30 AM · Sarah Johnson',
      avgWait: '7 min', rating: '4.9 (14)', waiting: '1', revenue: '₹24,560', score: 96, trend: [4, 6, 5, 7, 6, 8, 9],
    },
    {
      id: 'patel', name: 'Dr. Priya Patel', specialty: 'Internal Medicine', credentials: 'MBBS, MD (Internal Med.)', status: 'In a Visit', role: 'Doctors',
      location: 'Westfield Annex', today: 'Today: 7 appts', modes: '1 video, 6 in-person', next: 'Next: 11:00 AM · Michael Brown',
      avgWait: '6 min', rating: '4.8 (11)', waiting: '0', revenue: '₹19,240', score: 93, trend: [5, 5, 6, 6, 7, 7, 8],
    },
    {
      id: 'garcia', name: 'NP Maria Garcia', specialty: 'Family Medicine', credentials: 'MSN, FNP-BC', status: 'Online & Available', role: 'Nurse Practitioners',
      location: 'Northbridge Main', today: 'Today: 5 appts', modes: '2 video, 3 in-person', next: 'Next: 09:45 AM · Mike Lee',
      avgWait: '5 min', rating: '4.2 (8)', waiting: '2', revenue: '₹11,980', score: 88, trend: [5, 4, 6, 5, 6, 6, 7],
    },
    {
      id: 'chen', name: 'Dr. James Chen', specialty: 'Dermatology', credentials: 'MD, FAAD', status: 'Online & Available', role: 'Doctors',
      location: 'Westfield Annex', today: 'Today: 5 appts', modes: '1 video, 4 in-person', next: 'Next: 10:15 AM · Open slot',
      avgWait: '4 min', rating: '4.8 (12)', waiting: '0', revenue: '₹16,320', score: 91, trend: [4, 5, 5, 6, 7, 7, 8],
    },
    {
      id: 'brown', name: 'Kevin Brown', specialty: 'Orthopedics', credentials: 'PA-C', status: 'Offline', role: 'Physician Assistants',
      location: 'Harborview Satellite', today: 'Today: 0 appts', modes: 'Off today', next: 'Next: Tomorrow · 08:00 AM',
      avgWait: '—', rating: '4.6 (9)', waiting: '0', revenue: '₹0', score: 84, trend: [6, 5, 6, 5, 4, 5, 5],
    },
    {
      id: 'rao', name: 'Dr. Aisha Rao', specialty: 'Endocrinology', credentials: 'MD, FACE', status: 'Running Late', role: 'Doctors',
      location: 'Northbridge Main', today: 'Today: 6 appts', modes: '0 video, 6 in-person', next: 'Next: 11:30 AM · Olivia Martinez',
      avgWait: '15 min', rating: '4.7 (10)', waiting: '3', revenue: '₹13,400', score: 79, trend: [7, 6, 6, 5, 5, 4, 4],
    },
  ],
}
