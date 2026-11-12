import type { AppNotification } from '@/types'

/** Synthetic notifications only. No real patient information. */
export const notificationsFeedMock: AppNotification[] = [
  { id: 'n1', title: 'Waiting time is high', body: "Dr. Kumar's average wait is 23 min. Consider reassigning.", time: '5 min ago', read: false, to: '/clinic-schedule', kind: 'alert' },
  { id: 'n2', title: '3 open slots this afternoon', body: 'Promote available slots to fill the schedule.', time: '32 min ago', read: false, to: '/clinic-schedule', kind: 'info' },
  { id: 'n3', title: 'Invoice overdue', body: 'INV-20479 is past its due date.', time: '2 hours ago', read: false, to: '/billing-revenue', kind: 'billing' },
  { id: 'n4', title: 'New staff invitation accepted', body: 'Priya Nair joined Westfield Annex.', time: 'Yesterday', read: true, to: '/settings/user-management', kind: 'info' },
]

export const messagesFeedMock: AppNotification[] = [
  { id: 'm1', title: 'Dr. Kumar', body: 'Can we adjust my Friday schedule? I have a conference.', time: '10 min ago', read: false, to: '/clinic-schedule', kind: 'message' },
  { id: 'm2', title: 'Robert K.', body: 'Is it possible to get my lab results sent over?', time: '2 hours ago', read: false, to: '/clinic-schedule', kind: 'message' },
]
