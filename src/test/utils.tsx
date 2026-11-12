import { render } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from '@/app/providers/AppProviders'
import { createTestRouter } from '@/app/router'
import { tokenStorage } from '@/services/api/tokenStorage'
import type { AuthRole } from '@/types'

/** Seeds a valid demo session so protected routes render. */
export const signInAs = (role: AuthRole = 'Clinic administrator'): void => {
  tokenStorage.setSession({
    user: { id: 'test-user', name: 'Test User', email: 'test.user@example.com', role },
    accessToken: 'test-token',
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  })
}

export const renderApp = (path: string) => {
  const router = createTestRouter([path])
  const utils = render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return { router, ...utils }
}
