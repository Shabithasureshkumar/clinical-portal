export type SettingsSectionId =
  | 'clinic-profile'
  | 'locations'
  | 'services'
  | 'appointment-defaults'
  | 'virtual-visits'
  | 'billing-insurance'
  | 'notifications'
  | 'integrations'
  | 'user-management'
  | 'data-privacy'
  | 'help-legal'

/* ---------- Clinic profile ---------- */
export interface ClinicProfile {
  logoDataUrl: string | null
  name: string
  specialties: string
  website: string
  phone: string
  email: string
  npi: string
  description: string
}

/* ---------- Locations ---------- */
export type LocationType = 'Main clinic' | 'Satellite clinic' | 'Urgent care' | 'Telehealth hub'

export interface OperatingHours {
  day: string
  closed: boolean
  open: string
  close: string
}

export interface SettingsLocation {
  id: string
  name: string
  type: LocationType
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  email: string
  timezone: string
  hours: OperatingHours[]
  primary: boolean
  active: boolean
}

/* ---------- Services ---------- */
export type ConsultationType = 'In-person' | 'Virtual' | 'In-person & virtual'

export interface ClinicServiceItem {
  id: string
  name: string
  category: string
  description: string
  durationMin: number
  consultationType: ConsultationType
  price: number
  providers: string[]
  locationIds: string[]
  active: boolean
}

/* ---------- Appointment defaults ---------- */
export interface AppointmentDefaults {
  durationMin: number
  bufferMin: number
  minNoticeHours: number
  maxAdvanceDays: number
  cancellationPolicy: string
  cancellationWindowHours: number
  reschedulePolicy: string
  rescheduleLimit: number
  autoConfirm: boolean
  reminderEnabled: boolean
  reminderTimings: number[]
  reminderChannels: { email: boolean; sms: boolean; inApp: boolean }
  defaultAppointmentType: string
  workingDays: string[]
  defaultMode: 'In-person' | 'Virtual'
}

/* ---------- Virtual visits ---------- */
export interface VirtualVisitSettings {
  enabled: boolean
  provider: string
  meetingLinkTemplate: string
  waitingRoom: boolean
  waitingRoomMessage: string
  patientJoinMinutesBefore: number
  doctorJoinMinutesBefore: number
  accessMode: 'Secure link' | 'Patient portal sign-in' | 'Link + passcode'
  allowGuests: boolean
  audioOnByDefault: boolean
  videoOnByDefault: boolean
  allowScreenShare: boolean
  preInstructions: string
  notifyLinkSent: boolean
  notifyReminder: boolean
  reminderMinutes: number
}

/* ---------- Billing & insurance ---------- */
export interface PaymentMethodSetting {
  id: string
  label: string
  enabled: boolean
}

export interface BillingSettings {
  currency: string
  taxEnabled: boolean
  taxName: string
  taxRate: number
  paymentMethods: PaymentMethodSetting[]
  autoVerifyInsurance: boolean
  verifyHoursBefore: number
  autoInvoice: boolean
  sendReceipts: boolean
  collectCopayAtCheckIn: boolean
  invoicePrefix: string
  nextInvoiceNumber: number
  invoiceFooter: string
  paymentTerms: string
  refundPolicy: string
  notifyInvoiceSent: boolean
  notifyPaymentReceived: boolean
  notifyOverdue: boolean
}

export interface InsuranceProvider {
  id: string
  name: string
  payerId: string
  phone: string
  plans: string
  accepted: boolean
}

/* ---------- Notifications ---------- */
export interface NotificationEvent {
  id: string
  label: string
  description: string
  email: boolean
  sms: boolean
  inApp: boolean
}

export interface NotificationSettings {
  channels: { email: boolean; sms: boolean; inApp: boolean }
  events: NotificationEvent[]
  appointmentReminderHours: number[]
  virtualReminderMinutes: number
  quietHoursEnabled: boolean
  quietStart: string
  quietEnd: string
}

/* ---------- Integrations ---------- */
export type IntegrationCategory =
  | 'Electronic Health Records'
  | 'Payment gateways'
  | 'Video consultation'
  | 'Email services'
  | 'SMS services'
  | 'Calendar services'
  | 'Laboratory systems'

export interface IntegrationItem {
  id: string
  name: string
  category: IntegrationCategory
  description: string
  connected: boolean
  /** Demo connection: no credentials are verified against the vendor. */
  demo: boolean
  environment: 'Sandbox' | 'Production'
  lastChecked: string | null
}

/* ---------- Users ---------- */
export type UserRole = 'Clinic administrator' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Billing staff'
export type ClinicUserStatus = 'Active' | 'Inactive' | 'Invited'

export interface ClinicUser {
  id: string
  name: string
  email: string
  role: UserRole
  locationIds: string[]
  status: ClinicUserStatus
  lastActive: string
}

/* ---------- Data & privacy ---------- */
export interface SecuritySettings {
  twoFactorEnabled: boolean
  twoFactorMethod: 'Authenticator app' | 'SMS code'
  passwordMinLength: number
  requireSymbols: boolean
  requireMixedCase: boolean
  passwordExpiryDays: number
  sessionTimeoutMin: number
  restrictBillingAccess: boolean
  restrictClinicalNotes: boolean
  maskPatientIdentifiers: boolean
  requireReasonForRecordAccess: boolean
  retentionYears: number
  autoAnonymiseInactive: boolean
}

export interface ActiveSession {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}

export interface LoginActivityItem {
  id: string
  user: string
  result: 'Success' | 'Failed'
  ip: string
  when: string
}

export interface AuditLogItem {
  id: string
  actor: string
  action: string
  target: string
  when: string
}

export interface DataExportRequest {
  id: string
  requestedAt: string
  scope: string
  status: 'Requested (demo)'
}

/* ---------- Help & legal ---------- */
export interface FaqItem {
  id: string
  question: string
  answer: string
  topic: string
}
