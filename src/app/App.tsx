import { useMemo } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './providers/AppProviders'
import { createAppRouter } from './router'

export default function App() {
  const router = useMemo(() => createAppRouter(), [])
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
