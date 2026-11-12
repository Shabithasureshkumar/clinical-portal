import type { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/common/States'
import { ToastProvider } from '@/components/common/Toast'
import { AuthProvider } from '@/store/authStore'
import { WorkspaceProvider } from '@/store/workspaceStore'

/** Global providers: error boundary, auth session and toast feedback. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
