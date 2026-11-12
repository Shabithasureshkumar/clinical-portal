import { AlertTriangle, SearchX } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './Button'
import { cn } from '@/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[12px] bg-[#e9eff3]', className)} aria-hidden="true" />
}

export function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: cards }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-[18px]" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-[18px]" />
      <span className="sr-only">Loading content…</span>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <SearchX size={24} />
      </span>
      <p className="text-[17px] font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-[15px] text-muted">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-[18px] border border-[#fccaca] bg-[#fff7f7] px-6 py-14 text-center">
      <AlertTriangle className="text-bad" size={28} />
      <p className="text-[17px] font-semibold text-ink">Something went wrong</p>
      <p className="max-w-md text-[15px] text-muted">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

interface BoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Hook for a future error-reporting service.
    console.error('UI error boundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-8">
          <ErrorState message={this.state.error.message} onRetry={() => this.setState({ error: null })} />
        </div>
      )
    }
    return this.props.children
  }
}
