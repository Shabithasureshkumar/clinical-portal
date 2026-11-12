import type { AuthRole } from '@/types'
import { ROUTES } from './routes'

const ADMIN: AuthRole = 'Clinic administrator'

/**
 * UX-level route access. These only hide navigation and redirect in the browser;
 * the backend must independently authorize every request.
 */
export const ROUTE_ROLES: Partial<Record<string, readonly AuthRole[]>> = {
  [ROUTES.billing]: [ADMIN, 'Billing staff'],
  [ROUTES.reports]: [ADMIN, 'Doctor', 'Billing staff'],
  [ROUTES.users]: [ADMIN],
  [ROUTES.clinic]: [ADMIN],
  [ROUTES.settings]: [ADMIN],
}
