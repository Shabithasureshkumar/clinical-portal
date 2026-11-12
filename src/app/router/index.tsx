import { lazy } from 'react'
import { createBrowserRouter, createMemoryRouter, type RouteObject } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ForbiddenPage, NotFoundPage } from '@/features/errors/ErrorPages'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { PublicOnly, RequireAuth, RequireRole } from './guards'

const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const HomePage = lazy(() => import('@/features/dashboard/HomePage'))
const SchedulePage = lazy(() => import('@/features/appointments/SchedulePage'))
const ProvidersPage = lazy(() => import('@/features/doctors/ProvidersPage'))
const BillingPage = lazy(() => import('@/features/billing/BillingPage'))
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'))
const UsersPage = lazy(() => import('@/features/users/UsersPage'))
const ClinicPage = lazy(() => import('@/features/clinic/ClinicPage'))
const HelpPage = lazy(() => import('@/features/help/HelpPage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))

export const routes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [{ element: <PublicOnly />, children: [{ path: ROUTES.login, element: <LoginPage /> }] }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            element: <RequireRole />,
            children: [
              { path: ROUTES.home, element: <HomePage /> },
              { path: ROUTES.schedule, element: <SchedulePage /> },
              { path: ROUTES.providers, element: <ProvidersPage /> },
              { path: ROUTES.billing, element: <BillingPage /> },
              { path: ROUTES.reports, element: <ReportsPage /> },
              { path: ROUTES.users, element: <UsersPage /> },
              { path: ROUTES.clinic, element: <ClinicPage /> },
              { path: ROUTES.help, element: <HelpPage /> },
              { path: `${ROUTES.settings}/:section?`, element: <SettingsPage /> },
            ],
          },
          { path: ROUTES.forbidden, element: <ForbiddenPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

export const createAppRouter = () => createBrowserRouter(routes)
export const createTestRouter = (initialEntries: string[]) => createMemoryRouter(routes, { initialEntries })
