import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTE_ROLES } from '@/constants/permissions'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/store/authStore'

/** Redirects unauthenticated visitors to /login and remembers where they were going. */
export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: `${location.pathname}${location.search}` }} />
  }
  return <Outlet />
}

/** Redirects signed-in users who lack the role for the current route. UX only: the backend must enforce access. */
export function RequireRole() {
  const { hasRole } = useAuth()
  const { pathname } = useLocation()
  const key = Object.keys(ROUTE_ROLES).find((route) => pathname === route || pathname.startsWith(`${route}/`))
  if (key && !hasRole(ROUTE_ROLES[key])) return <Navigate to={ROUTES.forbidden} replace />
  return <Outlet />
}

/** Keeps signed-in users away from the login page. */
export function PublicOnly() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (isAuthenticated) {
    // Return to the page the user originally requested (see RequireAuth), otherwise Home.
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from && from.startsWith('/') && !from.startsWith('//') ? from : ROUTES.home} replace />
  }
  return <Outlet />
}
