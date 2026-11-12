import type { ReactNode } from 'react'
import { ErrorState, Skeleton } from '@/components/common/States'

interface SectionStateProps {
  loading: boolean
  error: string | null
  onRetry: () => void
  children: ReactNode
}

/** Shared loading / error wrapper for every settings section. */
export function SectionState({ loading, error, onRetry, children }: SectionStateProps) {
  if (error) return <ErrorState message={error} onRetry={onRetry} />
  if (loading) {
    return (
      <div role="status" aria-label="Loading section" className="space-y-5">
        <Skeleton className="h-28 rounded-[22px]" />
        <Skeleton className="h-72 rounded-[22px]" />
        <span className="sr-only">Loading section…</span>
      </div>
    )
  }
  return <>{children}</>
}
