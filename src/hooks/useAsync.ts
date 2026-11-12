import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizeError } from '@/services/api/apiClient'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

type Fetcher<T> = (opts: { signal: AbortSignal }) => Promise<T>

const isAbort = (e: unknown): boolean => e instanceof DOMException && e.name === 'AbortError'

/**
 * Generic data-fetching hook with loading / error / reload handling.
 * The in-flight request is aborted when the component unmounts or reloads.
 */
export function useAsync<T>(fetcher: Fetcher<T>): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    const controller = new AbortController()
    fetcherRef
      .current({ signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setData(result)
      })
      .catch((err: unknown) => {
        if (!isAbort(err) && !controller.signal.aborted) setError(normalizeError(err).message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
    // `tick` is a deliberate re-run trigger for reload().
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [tick])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    setTick((t) => t + 1)
  }, [])
  return { data, loading, error, reload }
}
