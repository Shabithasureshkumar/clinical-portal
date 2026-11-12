import {
  BarChart3,
  Building2,
  CalendarDays,
  LayoutGrid,
  Receipt,
  Settings,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES, type RoutePath } from './routes'

export interface NavItem {
  label: string
  to: RoutePath
  icon: LucideIcon
  badge?: number
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: ROUTES.home, icon: LayoutGrid },
  { label: 'Clinic Schedule', to: ROUTES.schedule, icon: CalendarDays, badge: 12 },
  { label: 'Providers', to: ROUTES.providers, icon: Stethoscope },
  { label: 'Billing & Revenue', to: ROUTES.billing, icon: Receipt },
  { label: 'Reports & Analytics', to: ROUTES.reports, icon: BarChart3 },
  { label: 'User Management', to: ROUTES.users, icon: Users },
  { label: 'Clinic Management', to: ROUTES.clinic, icon: Building2 },
  { label: 'Settings', to: ROUTES.settings, icon: Settings },
]
