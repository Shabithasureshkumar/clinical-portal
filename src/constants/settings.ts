import {
  Bell,
  Building2,
  CalendarDays,
  CreditCard,
  LifeBuoy,
  Link2,
  MapPin,
  Shield,
  Stethoscope,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react'
import type { SettingsSectionId } from '@/types'
import { ROUTES } from './routes'

export interface SettingsSectionMeta {
  id: SettingsSectionId
  label: string
  title: string
  description: string
  icon: LucideIcon
}

export const SETTINGS_SECTIONS: SettingsSectionMeta[] = [
  { id: 'clinic-profile', label: 'Clinic profile', title: 'Clinic profile', description: 'Your clinic identity and public details', icon: Building2 },
  { id: 'locations', label: 'Locations', title: 'Locations', description: 'Manage every clinic location, address and operating hours', icon: MapPin },
  { id: 'services', label: 'Services', title: 'Services', description: 'The services your clinic offers, with pricing and availability', icon: Stethoscope },
  { id: 'appointment-defaults', label: 'Appointment defaults', title: 'Appointment defaults', description: 'Make booking consistent across your organization', icon: CalendarDays },
  { id: 'virtual-visits', label: 'Virtual visits', title: 'Virtual visits', description: 'Configure how video consultations are offered and joined', icon: Video },
  { id: 'billing-insurance', label: 'Billing & insurance', title: 'Billing & insurance', description: 'Currency, taxes, payment methods and accepted insurance', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', title: 'Notifications', description: 'Choose how your team and patients stay informed', icon: Bell },
  { id: 'integrations', label: 'Integrations', title: 'Integrations', description: 'Connect the tools your clinic already uses', icon: Link2 },
  { id: 'user-management', label: 'User management', title: 'User management', description: 'Staff accounts, roles and location access', icon: Users },
  { id: 'data-privacy', label: 'Data & privacy', title: 'Data & privacy', description: 'Security, access controls and data retention', icon: Shield },
  { id: 'help-legal', label: 'Help & legal', title: 'Help & legal', description: 'Support resources, documentation and legal documents', icon: LifeBuoy },
]

export const DEFAULT_SETTINGS_SECTION: SettingsSectionId = 'clinic-profile'

export const settingsPath = (id: SettingsSectionId): string => `${ROUTES.settings}/${id}`

export const findSection = (id: string | undefined): SettingsSectionMeta | undefined =>
  SETTINGS_SECTIONS.find((s) => s.id === id)

export const TIMEZONES = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'Europe/London',
  'Asia/Kolkata',
  'Australia/Sydney',
]

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
export const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Support and legal destinations come from the environment so nothing is invented. */
export const SUPPORT = {
  email: import.meta.env.VITE_SUPPORT_EMAIL ?? '',
  phone: import.meta.env.VITE_SUPPORT_PHONE ?? '',
  docsUrl: import.meta.env.VITE_DOCS_URL ?? '',
  statusUrl: import.meta.env.VITE_STATUS_URL ?? '',
  termsUrl: import.meta.env.VITE_TERMS_URL ?? '',
  privacyUrl: import.meta.env.VITE_PRIVACY_URL ?? '',
  cookieUrl: import.meta.env.VITE_COOKIE_URL ?? '',
  appVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
}
