import type {
  ActiveSession,
  AppointmentDefaults,
  AuditLogItem,
  BillingSettings,
  ClinicProfile,
  ClinicServiceItem,
  ClinicUser,
  FaqItem,
  InsuranceProvider,
  IntegrationItem,
  LoginActivityItem,
  NotificationSettings,
  OperatingHours,
  SecuritySettings,
  SettingsLocation,
  VirtualVisitSettings,
} from '@/types'

const week = (open: string, close: string, weekend: 'closed' | 'half'): OperatingHours[] =>
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => {
    const isWeekend = i >= 5
    if (!isWeekend) return { day, closed: false, open, close }
    return weekend === 'closed' ? { day, closed: true, open, close } : { day, closed: i === 6, open: '09:00', close: '13:00' }
  })

export const profileMock: ClinicProfile = {
  logoDataUrl: null,
  name: 'Northstar Clinic',
  specialties: 'Internal Medicine, Cardiology',
  website: 'northstarclinic.com',
  phone: '(415) 555-0182',
  email: 'hello@northstarclinic.com',
  npi: '1841029384',
  description: '',
}

export const locationsMock: SettingsLocation[] = [
  {
    id: 'loc-1', name: 'Northbridge Main', type: 'Main clinic', address1: '1420 Harrow Street', address2: 'Suite 200',
    city: 'San Francisco', state: 'CA', zip: '94103', country: 'United States', phone: '(415) 555-0182',
    email: 'main@northstarclinic.com', timezone: 'America/Los_Angeles', hours: week('07:00', '19:00', 'half'), primary: true, active: true,
  },
  {
    id: 'loc-2', name: 'Westfield Annex', type: 'Satellite clinic', address1: '88 Westfield Plaza', address2: '',
    city: 'Oakland', state: 'CA', zip: '94607', country: 'United States', phone: '(510) 555-0144',
    email: 'westfield@northstarclinic.com', timezone: 'America/Los_Angeles', hours: week('08:00', '17:00', 'closed'), primary: false, active: true,
  },
  {
    id: 'loc-3', name: 'Harborview Satellite', type: 'Satellite clinic', address1: '12 Harbor Way', address2: '',
    city: 'Alameda', state: 'CA', zip: '94501', country: 'United States', phone: '(510) 555-0199',
    email: 'harborview@northstarclinic.com', timezone: 'America/Los_Angeles', hours: week('08:00', '17:00', 'closed'), primary: false, active: false,
  },
]

export const serviceCategories = ['Primary care', 'Cardiology', 'Endocrinology', 'Dermatology', 'Behavioral health', 'Preventive care', 'Diagnostics']
export const providerNames = ['Dr. Rajesh Kumar', 'Dr. Priya Patel', 'NP Maria Garcia', 'Dr. James Chen']

export const servicesMock: ClinicServiceItem[] = [
  { id: 'svc-1', name: 'Annual wellness visit', category: 'Preventive care', description: 'Comprehensive yearly physical and prevention review.', durationMin: 45, consultationType: 'In-person', price: 240, providers: ['Dr. Priya Patel', 'NP Maria Garcia'], locationIds: ['loc-1', 'loc-2'], active: true },
  { id: 'svc-2', name: 'Cardiology consult', category: 'Cardiology', description: 'Specialist evaluation of cardiovascular symptoms.', durationMin: 40, consultationType: 'In-person & virtual', price: 180, providers: ['Dr. Rajesh Kumar'], locationIds: ['loc-1'], active: true },
  { id: 'svc-3', name: 'Follow-up visit', category: 'Primary care', description: 'Short follow-up for an existing condition.', durationMin: 20, consultationType: 'In-person & virtual', price: 95, providers: ['Dr. Priya Patel', 'NP Maria Garcia', 'Dr. James Chen'], locationIds: ['loc-1', 'loc-2'], active: true },
  { id: 'svc-4', name: 'Dermatology consult', category: 'Dermatology', description: 'Skin, hair and nail concerns.', durationMin: 30, consultationType: 'In-person', price: 210, providers: ['Dr. James Chen'], locationIds: ['loc-2'], active: true },
  { id: 'svc-5', name: 'Telehealth check-in', category: 'Primary care', description: 'Brief video check-in for medication review.', durationMin: 15, consultationType: 'Virtual', price: 60, providers: ['NP Maria Garcia'], locationIds: ['loc-1', 'loc-2', 'loc-3'], active: false },
]

export const appointmentDefaultsMock: AppointmentDefaults = {
  durationMin: 30,
  bufferMin: 5,
  minNoticeHours: 4,
  maxAdvanceDays: 90,
  cancellationPolicy: 'Free cancellation up to the window, then a late-cancel fee may apply',
  cancellationWindowHours: 24,
  reschedulePolicy: 'Patients can reschedule up to the cancellation window',
  rescheduleLimit: 2,
  autoConfirm: true,
  reminderEnabled: true,
  reminderTimings: [24, 2],
  reminderChannels: { email: true, sms: true, inApp: true },
  defaultAppointmentType: 'Follow-up visit',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  defaultMode: 'In-person',
}

export const virtualVisitsMock: VirtualVisitSettings = {
  enabled: true,
  provider: 'Doxy.me',
  meetingLinkTemplate: 'https://doxy.me/{clinic-slug}/{appointment-id}',
  waitingRoom: true,
  waitingRoomMessage: 'Your provider will join shortly. Please keep this window open.',
  patientJoinMinutesBefore: 10,
  doctorJoinMinutesBefore: 15,
  accessMode: 'Secure link',
  allowGuests: false,
  audioOnByDefault: true,
  videoOnByDefault: true,
  allowScreenShare: false,
  preInstructions: 'Join from a quiet, well-lit space with a stable internet connection. Have your medication list ready.',
  notifyLinkSent: true,
  notifyReminder: true,
  reminderMinutes: 30,
}

export const billingSettingsMock: BillingSettings = {
  currency: 'USD',
  taxEnabled: false,
  taxName: 'Sales tax',
  taxRate: 0,
  paymentMethods: [
    { id: 'pm-card', label: 'Credit / debit card', enabled: true },
    { id: 'pm-ach', label: 'Bank transfer (ACH)', enabled: true },
    { id: 'pm-hsa', label: 'HSA / FSA card', enabled: true },
    { id: 'pm-cash', label: 'Cash at front desk', enabled: false },
    { id: 'pm-check', label: 'Check', enabled: false },
  ],
  autoVerifyInsurance: true,
  verifyHoursBefore: 48,
  autoInvoice: true,
  sendReceipts: true,
  collectCopayAtCheckIn: true,
  invoicePrefix: 'INV-',
  nextInvoiceNumber: 20483,
  invoiceFooter: 'Thank you for choosing Northstar Clinic.',
  paymentTerms: 'Net 30',
  refundPolicy: 'Refunds for overpayments are issued to the original payment method within 10 business days.',
  notifyInvoiceSent: true,
  notifyPaymentReceived: true,
  notifyOverdue: true,
}

export const insuranceMock: InsuranceProvider[] = [
  { id: 'ins-1', name: 'Star Health', payerId: 'STAR01', phone: '(800) 555-0111', plans: 'PPO, HMO', accepted: true },
  { id: 'ins-2', name: 'Aetna', payerId: '60054', phone: '(800) 555-0122', plans: 'PPO, EPO', accepted: true },
  { id: 'ins-3', name: 'Blue Cross', payerId: '00060', phone: '(800) 555-0133', plans: 'PPO', accepted: true },
  { id: 'ins-4', name: 'Medicare', payerId: 'MCARE', phone: '(800) 555-0144', plans: 'Part B', accepted: false },
]

export const notificationsMock: NotificationSettings = {
  channels: { email: true, sms: true, inApp: true },
  events: [
    { id: 'ev-appt', label: 'Appointment notifications', description: 'New bookings and schedule changes', email: true, sms: false, inApp: true },
    { id: 'ev-confirm', label: 'Appointment confirmations', description: 'When an appointment is confirmed', email: true, sms: true, inApp: true },
    { id: 'ev-cancel', label: 'Appointment cancellations', description: 'When a patient or provider cancels', email: true, sms: true, inApp: true },
    { id: 'ev-remind', label: 'Appointment reminders', description: 'Upcoming appointment reminders to patients', email: true, sms: true, inApp: false },
    { id: 'ev-reg', label: 'Patient registration', description: 'New patient sign-ups and intake completion', email: true, sms: false, inApp: true },
    { id: 'ev-pay', label: 'Payment notifications', description: 'Payments received, failed or refunded', email: true, sms: false, inApp: true },
    { id: 'ev-rx', label: 'Prescription notifications', description: 'Refill requests and prescription status', email: true, sms: false, inApp: true },
    { id: 'ev-virtual', label: 'Virtual consultation reminders', description: 'Join links and start-time reminders', email: true, sms: true, inApp: true },
  ],
  appointmentReminderHours: [24, 2],
  virtualReminderMinutes: 30,
  quietHoursEnabled: false,
  quietStart: '21:00',
  quietEnd: '07:00',
}

export const integrationsMock: IntegrationItem[] = [
  { id: 'int-epic', name: 'Epic', category: 'Electronic Health Records', description: 'Electronic health records', connected: true, demo: true, environment: 'Sandbox', lastChecked: 'Today, 09:12' },
  { id: 'int-athena', name: 'athenahealth', category: 'Electronic Health Records', description: 'Practice management and EHR', connected: false, demo: true, environment: 'Sandbox', lastChecked: null },
  { id: 'int-stripe', name: 'Stripe', category: 'Payment gateways', description: 'Card and wallet payments', connected: false, demo: true, environment: 'Sandbox', lastChecked: null },
  { id: 'int-square', name: 'Square', category: 'Payment gateways', description: 'In-clinic card payments', connected: false, demo: true, environment: 'Sandbox', lastChecked: null },
  { id: 'int-doxy', name: 'Doxy.me', category: 'Video consultation', description: 'Virtual visits', connected: true, demo: true, environment: 'Sandbox', lastChecked: 'Today, 09:12' },
  { id: 'int-zoom', name: 'Zoom Healthcare', category: 'Video consultation', description: 'Video consultations', connected: false, demo: true, environment: 'Sandbox', lastChecked: null },
  { id: 'int-sendgrid', name: 'SendGrid', category: 'Email services', description: 'Transactional email delivery', connected: false, demo: true, environment: 'Sandbox', lastChecked: null },
  { id: 'int-twilio', name: 'Twilio', category: 'SMS services', description: 'SMS reminders and alerts', connected: false, demo: true, environment: 'Sandbox', lastChecked: null },
  { id: 'int-gcal', name: 'Google Calendar', category: 'Calendar services', description: 'Two-way calendar sync', connected: false, demo: true, environment: 'Sandbox', lastChecked: null },
  { id: 'int-outlook', name: 'Outlook Calendar', category: 'Calendar services', description: 'Two-way calendar sync', connected: false, demo: true, environment: 'Sandbox', lastChecked: null },
  { id: 'int-quest', name: 'Quest Diagnostics', category: 'Laboratory systems', description: 'Lab orders and results', connected: false, demo: true, environment: 'Sandbox', lastChecked: null },
  { id: 'int-labcorp', name: 'Labcorp', category: 'Laboratory systems', description: 'Lab orders and results', connected: false, demo: true, environment: 'Sandbox', lastChecked: null },
]

export const clinicUsersMock: ClinicUser[] = [
  { id: 'cu-1', name: 'Sarah Williams', email: 's.williams@northbridge.health', role: 'Clinic administrator', locationIds: ['loc-1', 'loc-2', 'loc-3'], status: 'Active', lastActive: 'Just now' },
  { id: 'cu-2', name: 'Ethan Cole', email: 'e.cole@northbridge.health', role: 'Doctor', locationIds: ['loc-1'], status: 'Active', lastActive: '12 min ago' },
  { id: 'cu-3', name: 'Nina Okafor', email: 'n.okafor@northbridge.health', role: 'Doctor', locationIds: ['loc-1', 'loc-2'], status: 'Active', lastActive: '1 hour ago' },
  { id: 'cu-4', name: 'Lauren Pratt', email: 'l.pratt@northbridge.health', role: 'Nurse', locationIds: ['loc-1'], status: 'Active', lastActive: '3 hours ago' },
  { id: 'cu-5', name: 'Hannah Boyle', email: 'h.boyle@northbridge.health', role: 'Nurse', locationIds: ['loc-2'], status: 'Inactive', lastActive: '12 days ago' },
  { id: 'cu-6', name: 'Aisha Karim', email: 'a.karim@northbridge.health', role: 'Receptionist', locationIds: ['loc-1'], status: 'Active', lastActive: 'Yesterday' },
  { id: 'cu-7', name: 'Devin Marsh', email: 'd.marsh@northbridge.health', role: 'Billing staff', locationIds: ['loc-1', 'loc-2'], status: 'Active', lastActive: '2 days ago' },
  { id: 'cu-8', name: 'Priya Nair', email: 'p.nair@northbridge.health', role: 'Receptionist', locationIds: ['loc-2'], status: 'Invited', lastActive: 'Never' },
]

export const securityMock: SecuritySettings = {
  twoFactorEnabled: true,
  twoFactorMethod: 'Authenticator app',
  passwordMinLength: 12,
  requireSymbols: true,
  requireMixedCase: true,
  passwordExpiryDays: 90,
  sessionTimeoutMin: 30,
  restrictBillingAccess: true,
  restrictClinicalNotes: true,
  maskPatientIdentifiers: true,
  requireReasonForRecordAccess: false,
  retentionYears: 7,
  autoAnonymiseInactive: false,
}

export const sessionsMock: ActiveSession[] = [
  { id: 'ses-1', device: 'Chrome on Windows 11', location: 'San Francisco, CA', lastActive: 'Active now', current: true },
  { id: 'ses-2', device: 'Safari on iPhone', location: 'Oakland, CA', lastActive: '2 hours ago', current: false },
  { id: 'ses-3', device: 'Edge on Windows 10', location: 'Alameda, CA', lastActive: 'Yesterday', current: false },
]

export const loginActivityMock: LoginActivityItem[] = [
  { id: 'la-1', user: 'Sarah Williams', result: 'Success', ip: '203.0.113.24', when: 'Today, 08:41' },
  { id: 'la-2', user: 'Ethan Cole', result: 'Success', ip: '203.0.113.31', when: 'Today, 08:15' },
  { id: 'la-3', user: 'Unknown', result: 'Failed', ip: '198.51.100.77', when: 'Yesterday, 23:02' },
  { id: 'la-4', user: 'Devin Marsh', result: 'Success', ip: '203.0.113.52', when: 'Yesterday, 16:40' },
  { id: 'la-5', user: 'Hannah Boyle', result: 'Failed', ip: '203.0.113.60', when: 'Mon, 11:18' },
]

export const auditLogMock: AuditLogItem[] = [
  { id: 'al-1', actor: 'Sarah Williams', action: 'Updated appointment defaults', target: 'Settings', when: 'Today, 09:02' },
  { id: 'al-2', actor: 'Sarah Williams', action: 'Invited user', target: 'Priya Nair', when: 'Today, 08:50' },
  { id: 'al-3', actor: 'Devin Marsh', action: 'Exported invoices', target: 'Billing', when: 'Yesterday, 17:05' },
  { id: 'al-4', actor: 'Ethan Cole', action: 'Viewed patient record', target: 'MRN 10001', when: 'Yesterday, 10:21' },
  { id: 'al-5', actor: 'Sarah Williams', action: 'Deactivated user', target: 'Hannah Boyle', when: 'Mon, 14:30' },
  { id: 'al-6', actor: 'Lauren Pratt', action: 'Viewed patient record', target: 'MRN 98765', when: 'Mon, 09:12' },
]

export const faqMock: FaqItem[] = [
  { id: 'faq-1', topic: 'Appointments', question: 'How do I change the default appointment length?', answer: 'Open Settings → Appointment defaults and change the default duration, then choose Save changes. Existing appointments keep their original duration.' },
  { id: 'faq-2', topic: 'Appointments', question: 'Can I stop patients from booking on the same day?', answer: 'Yes. Increase the minimum booking notice under Appointment defaults so that same-day slots are no longer offered online.' },
  { id: 'faq-3', topic: 'Users', question: 'How do I invite a new staff member?', answer: 'Go to Settings → User management, choose Invite user, enter their name, email, role and the locations they can access.' },
  { id: 'faq-4', topic: 'Users', question: 'What can each role do?', answer: 'Clinic administrators manage all settings. Doctors and nurses work with clinical data. Receptionists manage scheduling. Billing staff manage invoices and insurance.' },
  { id: 'faq-5', topic: 'Billing', question: 'How are invoice numbers generated?', answer: 'Invoice numbers use the prefix and next number configured under Billing & insurance, and increase by one with each new invoice.' },
  { id: 'faq-6', topic: 'Virtual visits', question: 'Why can patients not join a video visit early?', answer: 'Patients can join only within the window set in Virtual visits (minutes before start). Increase it to allow earlier access.' },
  { id: 'faq-7', topic: 'Security', question: 'How do I require two-factor authentication?', answer: 'Open Data & privacy and turn on two-factor authentication. You will be asked to confirm before it is applied.' },
  { id: 'faq-8', topic: 'Integrations', question: 'Why does an integration say "Demo"?', answer: 'Until a backend is connected, integrations run in demo mode: nothing is verified with the vendor and no data is exchanged.' },
]
