export const ROUTES = {
  home: '/',
  schedule: '/clinic-schedule',
  providers: '/providers',
  billing: '/billing-revenue',
  reports: '/reports-analytics',
  users: '/user-management',
  clinic: '/clinic-management',
  settings: '/settings',
  help: '/help',
  login: '/login',
  forbidden: '/forbidden',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

/** Settings has nested section routes: /settings/:section */
export const routeTitle = (pathname: string): string => {
  if (pathname === ROUTES.settings || pathname.startsWith(`${ROUTES.settings}/`)) return 'Settings'
  return ROUTE_TITLES[pathname as RoutePath] ?? 'Workspace'
}

/** Breadcrumb titles keyed by route. */
export const ROUTE_TITLES: Partial<Record<RoutePath, string>> = {
  [ROUTES.home]: 'Home',
  [ROUTES.schedule]: 'Clinic Schedule',
  [ROUTES.help]: 'Help center',
  [ROUTES.providers]: 'Providers',
  [ROUTES.billing]: 'Billing & Revenue',
  [ROUTES.reports]: 'Reports & Analytics',
  [ROUTES.users]: 'User Management',
  [ROUTES.clinic]: 'Clinic Management',
  [ROUTES.settings]: 'Settings',
}
